import DifferentiatorSection from '@/component/about/DifferentiatorSection';
import StatisticsSection from '@/component/about/StatisticsSection';
import TeamSection from '@/component/about/TeamSection';
import Home from '@/component/home/Home';
import Review from '@/component/review/Review';
import Youtube from '@/component/youtube/Youtube';


export default function Page() {
  return (<>
      <div  style={{
    background: "linear-gradient(135deg, #0f172a 0%, #1a2332 50%, #0f172a 100%)",
  }}>  <Home />
        <Youtube />
          <DifferentiatorSection />
         <TeamSection />
        <Review/>
        <StatisticsSection/>
        </div>
    </>
  
  );
}
