import { ArrowLeft, Clock3, KeyRound } from "lucide-react";
import {
  IFUActionLink,
  IFUCard,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";

type AuthPlaceholderPageProps = {
  title: string;
  route: string;
  description: string;
  nextStep: string;
};

export function AuthPlaceholderPage({
  title,
  route,
  description,
  nextStep,
}: AuthPlaceholderPageProps) {
  return (
    <IFUPage>
      <IFUHero
        eyebrow="Milestone 5 prep"
        title={title}
        description={description}
        aside={
          <IFUCard tone="hero" className="p-5">
            <Clock3 className="h-5 w-5 text-[var(--ifu-accent)]" aria-hidden="true" />
            <p className="mt-4 text-sm font-bold uppercase text-white/65">Status</p>
            <p className="mt-2 text-3xl font-bold text-white">Coming soon</p>
            <p className="mt-4 font-mono text-sm text-white/70">{route}</p>
          </IFUCard>
        }
      >
        <IFUActionLink href="/" variant="ghost" icon={ArrowLeft}>
          Discovery center
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="py-10">
          <IFUCard tone="muted" className="p-6">
            <KeyRound className="ifu-icon h-5 w-5" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-[var(--ifu-heading)]">
              Authentication wiring is pending Cognito setup.
            </h2>
            <p className="ifu-copy mt-3 max-w-3xl">{nextStep}</p>
          </IFUCard>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
