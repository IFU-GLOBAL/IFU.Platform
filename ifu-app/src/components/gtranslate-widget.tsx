"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { cn } from "@/components/ifu-ui";

const GT_SCRIPT_SRC = "/wp-content/plugins/gtranslate/js/dwf.js%3Fver=7.0";
const GT_LANGUAGES = [
  "af",
  "sq",
  "am",
  "ar",
  "hy",
  "az",
  "eu",
  "be",
  "bn",
  "bs",
  "bg",
  "ca",
  "ceb",
  "ny",
  "zh-CN",
  "zh-TW",
  "co",
  "hr",
  "cs",
  "da",
  "nl",
  "en",
  "eo",
  "et",
  "tl",
  "fi",
  "fr",
  "fy",
  "gl",
  "ka",
  "de",
  "el",
  "gu",
  "ht",
  "ha",
  "haw",
  "iw",
  "hi",
  "hmn",
  "hu",
  "is",
  "ig",
  "id",
  "ga",
  "it",
  "ja",
  "jw",
  "kn",
  "kk",
  "km",
  "ko",
  "ku",
  "ky",
  "lo",
  "la",
  "lv",
  "lt",
  "lb",
  "mk",
  "mg",
  "ms",
  "ml",
  "mt",
  "mi",
  "mr",
  "mn",
  "my",
  "ne",
  "no",
  "ps",
  "fa",
  "pl",
  "pt",
  "pa",
  "ro",
  "ru",
  "sm",
  "gd",
  "sr",
  "st",
  "sn",
  "sd",
  "si",
  "sk",
  "sl",
  "so",
  "es",
  "su",
  "sw",
  "sv",
  "tg",
  "ta",
  "te",
  "th",
  "tr",
  "uk",
  "ur",
  "uz",
  "vi",
  "cy",
  "xh",
  "yi",
  "yo",
  "zu",
];

declare global {
  interface Window {
    gtranslateSettings?: Record<string, unknown>;
  }
}

type GTranslateWidgetProps = {
  id?: string;
  variant?: "inline" | "floating";
  hideOnDiscovery?: boolean;
};

function configureWidget(widgetId: string, wrapperId: string, variant: "inline" | "floating") {
  window.gtranslateSettings = window.gtranslateSettings || {};
  window.gtranslateSettings[widgetId] = {
    default_language: "en",
    languages: GT_LANGUAGES,
    url_structure: "none",
    detect_browser_language: 1,
    flag_style: "2d",
    flag_size: 16,
    wrapper_selector: `#${wrapperId}`,
    alt_flags: { en: "usa" },
    switcher_open_direction: variant === "floating" ? "bottom" : "top",
    switcher_horizontal_position: "inline",
    switcher_text_color: "#082947",
    switcher_arrow_color: "#082947",
    switcher_border_color: "rgba(8, 41, 71, 0.18)",
    switcher_background_color: "#ffffff",
    switcher_background_shadow_color: "#f4f7fa",
    switcher_background_hover_color: "#ffffff",
    dropdown_text_color: "#082947",
    dropdown_hover_color: "#ffffff",
    dropdown_background_color: "#eef3f8",
    flags_location: "https://cdn.gtranslate.net/flags/",
  };
}

export function GTranslateWidget({
  id = "ifu-app",
  variant = "inline",
  hideOnDiscovery = false,
}: GTranslateWidgetProps) {
  const pathname = usePathname();
  const widgetId = `ifu-${id}`;
  const wrapperId = `gt-wrapper-${widgetId}`;

  useEffect(() => {
    if (hideOnDiscovery && pathname === "/discovery") {
      return;
    }

    const wrapper = document.getElementById(wrapperId);
    const scriptId = `gt-script-${widgetId}`;

    if (!wrapper) {
      return;
    }

    wrapper.innerHTML = "";
    document.getElementById(scriptId)?.remove();
    configureWidget(widgetId, wrapperId, variant);

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = GT_SCRIPT_SRC;
    script.defer = true;
    script.dataset.noOptimize = "1";
    script.dataset.noMinify = "1";
    script.dataset.gtOrigUrl = window.location.pathname;
    script.dataset.gtOrigDomain = window.location.hostname;
    script.dataset.gtWidgetId = widgetId;
    document.body.appendChild(script);

    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [hideOnDiscovery, pathname, variant, widgetId, wrapperId]);

  if (hideOnDiscovery && pathname === "/discovery") {
    return null;
  }

  return (
    <div
      className={cn(
        "ifu-gtranslate",
        variant === "floating" && "ifu-gtranslate-floating",
      )}
      aria-label="Global language selector"
    >
      <div className="ifu-gtranslate__label">
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span>Global Language</span>
      </div>
      <div className="gtranslate_wrapper ifu-gtranslate__control" id={wrapperId} />
    </div>
  );
}
