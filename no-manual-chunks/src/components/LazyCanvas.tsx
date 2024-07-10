import { lazy, Suspense } from "react";
const Lazy = lazy(() => import("./LazyCanvasPreload"));

const FullPageSpinner = () => <>spinner no-manual-chunks...</>;

const Component = () => {
  return (
    <>
      <Suspense fallback={<FullPageSpinner />}>
        <Lazy />
      </Suspense>
    </>
  );
};

export default Component;
