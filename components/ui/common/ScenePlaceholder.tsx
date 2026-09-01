import Loader8D from "./Loader8D";

function ScenePlaceholder() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader8D size={130} label="Loading port scene…" />
        </div>
    );
}