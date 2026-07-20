"use client";

import { IFUActionButton, IFUContainer, IFUPage } from "@/components/ifu-ui";

export default function AgriSphereError({ reset }: { reset: () => void }) {
  return (
    <IFUPage className="agrisphere-page">
      <IFUContainer size="wide" className="py-10">
        <div className="agrisphere-route-state agrisphere-route-state-error">
          <strong>AgriSphere could not load</strong>
          <span>Retry the public discovery workspace.</span>
          <IFUActionButton type="button" onClick={reset}>
            Retry
          </IFUActionButton>
        </div>
      </IFUContainer>
    </IFUPage>
  );
}
