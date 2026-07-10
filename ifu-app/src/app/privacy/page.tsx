import type { Metadata } from "next";
import { ArrowLeft, Mail } from "lucide-react";
import {
  IFUActionLink,
  IFUContainer,
  IFUHero,
  IFUPage,
  IFUSection,
} from "@/components/ifu-ui";

export const metadata: Metadata = {
  title: "IFU Privacy Notice | IFU Platform",
  description:
    "Short-form privacy notice for IFU pre-launch preview applications.",
};

const noticeSections = [
  {
    title: "Who we are",
    body: "The IFU Platform is operated by IFU Platform (ifuplatform.com and internationalfarmunion.com). Our charitable affiliate is FarmerUnion.org, a 501(c)(3) organization.",
  },
  {
    title: "What we collect",
    body: "When you submit the preview form, we collect the details you provide: name, email, phone, country, organization, current role, selected IFU roles, leadership interest, contribution preferences, and referral information.",
  },
  {
    title: "Why we collect it",
    body: "We use this information to review your application, match you to your selected role, contact you about the IFU Platform preview and launch, and understand which roles and countries our early community represents.",
  },
  {
    title: "What we never do",
    body: "We never sell your data. We never share it with advertisers. Your data is owned by you.",
  },
  {
    title: "Where it is stored",
    body: "Data is stored securely on Amazon Web Services with encryption in transit and at rest.",
  },
  {
    title: "Your rights",
    body: "You may request a copy of your data, correct it, or ask us to delete it at any time by emailing privacy@ifuplatform.com. If you are in the EU/EEA or UK, you have rights under the GDPR; if you are a California resident, you have rights under the CCPA. We honor these rights for all applicants worldwide.",
  },
  {
    title: "Retention",
    body: "If the IFU Platform does not launch a membership for you, application data is deleted within 24 months of submission. Referred-person data is deleted within 90 days if the referred person does not respond.",
  },
];

export default function PrivacyPage() {
  return (
    <IFUPage>
      <IFUHero
        eyebrow="Privacy notice"
        title="IFU Privacy Notice for Pre-Launch Applications"
        description="Short-form privacy notice for people submitting IFU preview applications or receiving a one-time referral invitation."
      >
        <IFUActionLink href="/discovery" variant="ghost" icon={ArrowLeft}>
          Discovery center
        </IFUActionLink>
      </IFUHero>

      <IFUSection>
        <IFUContainer className="py-10 lg:py-14">
          <div className="ifu-card ifu-card-muted p-6 sm:p-8">
            <div className="grid gap-5">
              {noticeSections.map((section) => (
                <section key={section.title}>
                  <h2 className="text-xl font-bold text-[var(--ifu-heading)]">
                    {section.title}
                  </h2>
                  <p className="ifu-copy mt-2">{section.body}</p>
                </section>
              ))}
            </div>

            <section id="delete-request" className="mt-8 border-t border-[var(--ifu-border)] pt-6">
              <h2 className="text-xl font-bold text-[var(--ifu-heading)]">
                Decline or delete a referral record
              </h2>
              <p className="ifu-copy mt-2">
                If someone recommended you and you do not want IFU to keep your referral record, email privacy@ifuplatform.com and request deletion.
              </p>
              <IFUActionLink
                href="mailto:privacy@ifuplatform.com?subject=Delete%20my%20IFU%20referral%20record"
                icon={Mail}
                className="mt-5"
              >
                Email privacy@ifuplatform.com
              </IFUActionLink>
            </section>
          </div>
        </IFUContainer>
      </IFUSection>
    </IFUPage>
  );
}
