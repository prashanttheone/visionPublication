import Gallery from "@/component/gallery/Gallery";

export const metadata = {
  title: "Gallery | Vision Publication",
  description: "View our collection of academic and competitive exam resources.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen pt-20">
      <Gallery />
    </main>
  );
}
