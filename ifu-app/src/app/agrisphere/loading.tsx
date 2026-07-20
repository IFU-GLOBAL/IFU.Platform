import { IFUContainer, IFUPage } from "@/components/ifu-ui";

export default function AgriSphereLoading() {
  return (
    <IFUPage className="agrisphere-page">
      <IFUContainer size="wide" className="py-10">
        <div className="agrisphere-route-state">
          <strong>Loading AgriSphere</strong>
          <span>Preparing map, search, and public discovery data.</span>
        </div>
      </IFUContainer>
    </IFUPage>
  );
}
