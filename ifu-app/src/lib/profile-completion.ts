const EMPTY_PROFILE_VALUES = new Set(["", "Profile Pending"]);

function hasProfileValue(value: string | null | undefined) {
  return !EMPTY_PROFILE_VALUES.has(value?.trim() ?? "");
}

export type ProfileCompletionInput = {
  selectedRoleCount: number;
  country: string | null | undefined;
  stateProvince: string | null | undefined;
  city: string | null | undefined;
  organization: string | null | undefined;
  preferredLanguage: string | null | undefined;
  interestCount: number;
  timezone: string | null | undefined;
  cropLivestockCount: number;
  farmSizeBand: string | null | undefined;
  goals: string | null | undefined;
};

export function computeProfileCompletion(input: ProfileCompletionInput) {
  const fields = [
    input.selectedRoleCount > 0,
    hasProfileValue(input.country),
    hasProfileValue(input.stateProvince),
    hasProfileValue(input.city),
    hasProfileValue(input.organization),
    hasProfileValue(input.preferredLanguage),
    input.interestCount > 0,
    hasProfileValue(input.timezone),
    input.cropLivestockCount > 0,
    hasProfileValue(input.farmSizeBand),
    hasProfileValue(input.goals),
  ];
  const completed = fields.filter(Boolean).length;

  return Math.min(100, Math.max(20, Math.round((completed / fields.length) * 100)));
}

export function mergeProfileCompletion(
  storedCompletion: number | null | undefined,
  input: ProfileCompletionInput,
) {
  return Math.max(storedCompletion ?? 0, computeProfileCompletion(input));
}
