import { IFUContainer, IFUPage } from "@/components/ifu-ui";

export default function AgriSphereLoading() {
  return (
    <IFUPage className="agrisphere-page">
      <IFUContainer size="wide" className="py-10">
        <div className="agrisphere-route-state">
          <strong>Loading AgriSphere</strong>
          <span>Opening the authenticated dashboard hub.</span>
        </div>
      </IFUContainer>
    </IFUPage>
  );
}
