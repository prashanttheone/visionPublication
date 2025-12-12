import Home from '@/component/home/Home';
import CloudinaryImageUpload from '@/component/imageUpload/CloudinaryImageUpload';
import Review from '@/component/review/Review';
import Youtube from '@/component/youtube/Youtube';


export default function Page() {
  return (<>
  <CloudinaryImageUpload></CloudinaryImageUpload>
      <Home />
        <Youtube />
        <Review/>
    </>
  
  );
}
