import { useCallback, useEffect, useState } from "react";
import { Intro } from "./Intro";
import { Hero } from "./Hero";
import { Transformation } from "./Transformation";
import { Services } from "./Services";
import { Story1989 } from "./Story1989";
import { PrecisionLab } from "./PrecisionLab";
import { CaseStudy } from "./CaseStudy";
import { NewsArticles } from "./NewsArticles";
import { ProcessFilm } from "./ProcessFilm";
import { WarrantyTrust } from "./WarrantyTrust";
import { Booking } from "./Booking";
import { Finale } from "./Finale";
import {
  mediaUrl,
  useGeneralInformation,
  useStaticImages,
} from "../../lib/siteContent";

/* THE PRIVATE AUTOMOTIVE ATELIER — Al-Sorouh flagship homepage (AR / RTL). */

const replayIntroEvent = "alsorouh:replay-intro";

let hasPlayedIntroThisLoad = false;

export function HomeExperience() {
  const [introDone, setIntroDone] = useState(hasPlayedIntroThisLoad);
  const [introKey, setIntroKey] = useState(0);
  const generalInformation = useGeneralInformation();
  const homeImages = useStaticImages("home-page");

  useEffect(() => {
    const replayIntro = () => {
      setIntroDone(false);
      setIntroKey((key) => key + 1);
    };
    window.addEventListener(replayIntroEvent, replayIntro);
    return () => window.removeEventListener(replayIntroEvent, replayIntro);
  }, []);

  useEffect(() => {
    if (introDone) return;
    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;
    };
  }, [introDone]);

  const completeIntro = useCallback(() => {
    hasPlayedIntroThisLoad = true;
    setIntroDone(true);
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
      window.dispatchEvent(new Event("resize"));
    });
  }, []);

  return (
    <div className="home-experience relative min-h-screen bg-[#060708] text-[var(--sorouh-ivory)]">
      {!introDone && <Intro key={introKey} onDone={completeIntro} />}
      <Hero
        headlinePrimary={generalInformation ? { ar: generalInformation.main_title_ar, en: generalInformation.main_title } : undefined}
        headlineSecondary={generalInformation ? { ar: generalInformation.second_title_ar, en: generalInformation.second_title } : undefined}
        supportingCopy={generalInformation ? { ar: generalInformation.description_ar, en: generalInformation.description } : undefined}
        backgroundImageUrl={mediaUrl(generalInformation?.hero_img)}
      />
      <Transformation
        images={
          homeImages && [
            homeImages.first_step_image,
            homeImages.second_step_image,
            homeImages.third_step_image,
            homeImages.fourth_step_image,
          ]
        }
      />
      <Services />
      <Story1989 image={homeImages?.story_image} />
      {/* <PrecisionLab /> */}
      <CaseStudy
        beforeImage={homeImages?.case_study_before_image}
        afterImage={homeImages?.case_study_after_image}
      />
      {/* <NewsArticles /> */}
      <ProcessFilm
        images={
          homeImages && [
            homeImages.process_image_first,
            homeImages.process_image_second,
            homeImages.process_image_third,
            homeImages.process_image_fourth,
            homeImages.process_image_fifth,
            homeImages.process_image_sixth,
          ]
        }
      />
      <WarrantyTrust />
      <Finale image={homeImages?.end_image} />
      {/* <Booking /> */}
    </div>
  );
}
