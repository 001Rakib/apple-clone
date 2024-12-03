"use client";
import { hightlightsSlides } from "@/constant";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Image from "next/image";
import { Metadata } from "next/types";
import { useEffect, useRef, useState } from "react";

const VIdeoCarousel = () => {
  const videoRef = useRef<(HTMLVideoElement | null)[]>([]);
  const videoSpanRef = useRef<(HTMLSpanElement | null)[]>([]);
  const videoDivRef = useRef<(HTMLSpanElement | null)[]>([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });
  const [loadedData, setLoadedData] = useState<Metadata[]>([]);

  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  useGSAP(() => {
    gsap.to("#slider", {
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: "power2.inOut",
    });
    gsap.to("#video", {
      scrollTrigger: {
        trigger: "#video",
        toggleActions: "restart none none none",
      },
      onComplete: () => {
        setVideo((preVideo) => ({
          ...preVideo,
          startPlay: true,
          isPlaying: true,
        }));
      },
    });
  }, [isEnd, videoId]);

  useEffect(() => {
    if (loadedData.length > 3) {
      if (!isPlaying) {
        videoRef.current[videoId]?.pause();
      } else {
        if (startPlay) {
          videoRef.current[videoId]?.play();
        }
      }
    }
  }, [startPlay, videoId, isPlaying, loadedData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLoadedMetaData = (i: number, e: any) =>
    setLoadedData((pre) => [...pre, e]);

  useEffect(() => {
    let currentProgress = 0;
    const span = videoSpanRef.current;

    if (span[videoId]) {
      //animate the progress of the video
      const animate = gsap.to(span[videoId], {
        onUpdate: () => {
          const progress = Math.ceil(animate.progress() * 100);
          if (progress !== currentProgress) {
            currentProgress = progress;

            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw"
                  : window.innerWidth < 1200
                  ? "10vw"
                  : "4vw",
            });
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });
      if (videoId === 0) {
        animate.restart();
      }
      const animateUpdate = () => {
        const videoElement = videoRef.current[videoId];
        if (videoElement) {
          animate.progress(
            videoElement.currentTime / hightlightsSlides[videoId].videoDuration
          );
        }
      };
      if (isPlaying) {
        gsap.ticker.add(animateUpdate);
      } else {
        gsap.ticker.remove(animateUpdate);
      }
    }
  }, [videoId, startPlay, isPlaying]);

  const handleProcess = (actions: string, i?: number) => {
    switch (actions) {
      case "video-end":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isEnd: true,
          videoId: i! + 1,
        }));
        break;
      case "video-last":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isLastVideo: true,
        }));
        break;
      case "video-reset":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isLastVideo: false,
          videoId: 0,
        }));
        break;
      case "play":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));
        break;
      case "pause":
        setVideo((prevVideo) => ({
          ...prevVideo,
          isPlaying: !prevVideo.isPlaying,
        }));
        break;

      default:
        return video;
    }
  };

  return (
    <>
      <div className="flex items-center">
        {hightlightsSlides.map((list, idx) => (
          <div key={idx} id="slider" className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full flex-center rounded-3xl overflow-hidden bg-black">
                <video
                  id="video"
                  className={`${
                    list.id === 2 && "translate-x-44"
                  } pointer-events-none`}
                  playsInline={true}
                  preload="auto"
                  muted
                  ref={(el) => {
                    if (videoRef.current) {
                      videoRef.current[idx] = el;
                    }
                  }}
                  onPlay={() =>
                    setVideo((preVideo) => ({
                      ...preVideo,
                      isPlaying: true,
                    }))
                  }
                  onEnded={() =>
                    idx !== 3
                      ? handleProcess("video-end", idx)
                      : handleProcess("video-last")
                  }
                  onLoadedMetadata={(e) => handleLoadedMetaData(idx, e)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-1/2 left-[5%] z-10">
                {list.textLists.map((text, idx) => (
                  <p className="md:text-2xl text-xl font-medium" key={idx}>
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, idx) => (
            <span
              key={idx}
              ref={(el) => {
                if (videoDivRef.current) {
                  videoDivRef.current[idx] = el;
                }
              }}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                ref={(el) => {
                  if (videoSpanRef.current) {
                    videoSpanRef.current[idx] = el;
                  }
                }}
                className="absolute h-full w-full rounded-full"
              />
            </span>
          ))}
        </div>
        <button className="control-btn">
          <Image
            src={
              isLastVideo
                ? "/assets/images/replay.svg"
                : !isPlaying
                ? "/assets/images/play.svg"
                : "/assets/images/pause.svg"
            }
            alt="video-control"
            width={18}
            height={18}
            onClick={
              isLastVideo
                ? () => handleProcess("video-reset")
                : !isPlaying
                ? () => handleProcess("play")
                : () => handleProcess("pause")
            }
          />
        </button>
      </div>
    </>
  );
};

export default VIdeoCarousel;
