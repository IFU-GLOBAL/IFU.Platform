#!/usr/bin/env tsx

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { buildInvitationLink, createInvitation } from "../src/lib/invitations";

type CsvRow = Record<string, string>;

function usage() {
  console.error("Usage: npm run invitations:import -- ./path/to/invitations.csv");
  console.error("Columns: name,email,phone,country,suggested_role,invited_by,channel,expires_at");
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      row.push(field);
      if (row.some((value) => value.trim())) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim())) {
    rows.push(row);
  }

  return rows;
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function rowsToObjects(rows: string[][]): CsvRow[] {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    return [];
  }

  const headers = headerRow.map(normalizeHeader);

  return dataRows.map((dataRow) =>
    Object.fromEntries(headers.map((header, index) => [header, dataRow[index]?.trim() ?? ""])),
  );
}

function parseDate(value: string) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    usage();
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), csvPath);
  const text = await fs.readFile(absolutePath, "utf8");
  const rows = rowsToObjects(parseCsv(text));

  if (rows.length === 0) {
    console.error("No invitation rows found.");
    process.exit(1);
  }

  const outputRows = [
    ["name", "email", "phone", "country", "suggested_role", "invited_by", "channel", "code", "invite_link", "expires_at"],
  ];

  for (const row of rows) {
    const invitation = await createInvitation({
      name: row.name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      suggestedRole: row.suggested_role || row.suggestedrole,
      invitedBy: row.invited_by || row.invitedby,
      channel: row.channel || "copy_link",
      expiresAt: parseDate(row.expires_at || row.expiresat),
    });

    outputRows.push([
      invitation.name ?? "",
      invitation.email ?? "",
      invitation.phone ?? "",
      invitation.country ?? "",
      invitation.suggestedRole ?? "",
      invitation.invitedBy ?? "",
      invitation.channel,
      invitation.code,
      buildInvitationLink(invitation.code),
      invitation.expiresAt.toISOString(),
    ]);
  }

  console.log(outputRows.map((row) => row.map(csvEscape).join(",")).join("\n"));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
