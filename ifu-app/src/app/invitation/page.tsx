import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Mail,
  MessageCircle,
  Share2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  IFUActionLink,
  IFUCard,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
  IFUSectionHeader,
} from "@/components/ifu-ui";

export const metadata: Metadata = {
  title: "Invitation Letter | IFU Platform",
  description:
    "Read the IFU preview invitation letter and continue to the Role-Based Discovery Center.",
};

const previewPoints = [
  "Review the IFU ecosystem before public rollout.",
  "Select the roles and pathways that match your interests.",
  "Share contact, leadership, referral, and contribution details.",
  "Help IFU coordinate follow-up, introductions, and early access priorities.",
];

const letterParagraphs = [
  "The International Farm Union invites you to preview the IFU platform and help shape the next stage of global agricultural collaboration.",
  "IFU is being built as a connected ecosystem for farmers, cooperatives, researchers, development institutions, buyers, educators, funders, technology partners, and community leaders. The platform is designed to help people discover where they fit, identify useful role pathways, and connect with the programs, tools, data, training, markets, and leadership opportunities most relevant to them.",
  "This preview invitation is an early opportunity to explore the Role-Based Discovery Center before broader public rollout. Your selections will help IFU understand your interests, your organization or community context, and the kinds of follow-up that would be most useful.",
  "The preview form is not a final membership commitment. It is a structured way to express interest, recommend contacts, identify role pathways, and help IFU prepare a practical onboarding process for different regions, sectors, and partner groups.",
  "We welcome your participation, feedback, referrals, and leadership interest as IFU prepares the next phase of platform access.",
];

const cognitoRegisterHref = "/api/auth/register?returnTo=%2Fdashboard";
const discoveryShareUrl = "https://ifuplatform.com/discovery";
const invitationShareText =
  "You are invited to preview the International Farm Union platform and choose the IFU role pathway that fits you.";
const encodedShareText = encodeURIComponent(`${invitationShareText} ${discoveryShareUrl}`);
const shareLinks = [
  {
    label: "Email",
    href: `mailto:?subject=${encodeURIComponent("IFU preview invitation")}&body=${encodedShareText}`,
    icon: Mail,
  },
  {
    label: "LinkedIn",
    href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(discoveryShareUrl)}`,
    icon: Share2,
    external: true,
  },
  {
    label: "WhatsApp",
    href: `https://wa.me/?text=${encodedShareText}`,
    icon: MessageCircle,
    external: true,
  },
];

export default function InvitationPage() {
  return (
    <IFUPage className="ifu-invitation-page">
      <IFUHero
        eyebrow="Preview invitation"
        title="You are invited to preview the IFU ecosystem"
        description="Read the invitation, choose the IFU roles that match your work, then register or share the invitation with someone who belongs in the IFU community."
        aside={
          <IFUCard tone="hero" className="p-6">
            <BadgeCheck className="h-6 w-6 text-[var(--ifu-accent)]" aria-hidden="true" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-white/60">
              Preview status
            </p>
            <p className="mt-2 text-3xl font-bold text-white">Early access</p>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Role selection, referral intake, and preview submissions are open for review.
            </p>
          </IFUCard>
        }
      >
        <IFUActionLink href="/discovery" variant="ghost" icon={ArrowLeft}>
          Discovery center
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="grid gap-8 py-10 lg:grid-cols-[1fr_320px] lg:py-14">
          <article className="ifu-card ifu-invitation-letter p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ifu-primary)]">
              International Farm Union
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--ifu-heading)]">
              You are invited to preview the IFU ecosystem
            </h2>

            <div className="mt-8 space-y-5 text-base leading-8 text-[var(--ifu-body)]">
              <p>Dear IFU partner,</p>
              {letterParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <div>
                <p>With appreciation,</p>
                <p className="font-semibold text-[var(--ifu-heading)]">
                  International Farm Union
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <IFUActionLink href={cognitoRegisterHref} icon={UserPlus}>
                Register
              </IFUActionLink>
              {shareLinks.map((link) => (
                <IFUActionLink
                  key={link.label}
                  href={link.href}
                  variant="outline"
                  icon={link.icon}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  ariaLabel={`Share IFU invitation by ${link.label}`}
                >
                  {link.label}
                </IFUActionLink>
              ))}
              <IFUActionLink href="/discovery#role-matrix" variant="outline" icon={Users}>
                Choose roles
              </IFUActionLink>
            </div>
          </article>

          <aside className="grid content-start gap-4">
            <IFUCard className="p-5">
              <Mail className="ifu-icon h-5 w-5" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold text-[var(--ifu-heading)]">
                Invitation purpose
              </h3>
              <p className="ifu-copy mt-2 text-sm">
                The letter gives invitees a clear entry point before they choose roles or submit the preview form.
              </p>
            </IFUCard>

            <IFUCard className="p-5">
              <h3 className="text-lg font-bold text-[var(--ifu-heading)]">
                What preview participants can do
              </h3>
              <ul className="mt-4 space-y-3">
                {previewPoints.map((point) => (
                  <li key={point} className="flex gap-3 text-sm leading-6 text-[var(--ifu-body)]">
                    <CheckCircle2
                      className="mt-1 h-4 w-4 shrink-0 text-[var(--ifu-primary)]"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </IFUCard>
          </aside>
        </IFUContainer>
      </IFUSection>

      <IFUSection tone="muted">
        <IFUContainer className="py-10">
          <IFUSectionHeader
            eyebrow="Next step"
            title="Start with role discovery"
            description="The discovery flow captures the roles, pathways, referrals, and contribution interests IFU needs for practical follow-up."
            action={
              <IFUActionLink href="/discovery#role-matrix" icon={ArrowRight}>
                Choose roles
              </IFUActionLink>
            }
          />
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
