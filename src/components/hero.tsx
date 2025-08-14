import stars from "@/assets/stars.png";
import squares from "@/assets/squares.png";
import text from "@/assets/text.png";


export default function Hero() {
    return (
        <div className="relative block mx-auto w-full max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] h-[150px] sm:h-[200px] md:h-[250px] lg:h-[300px] my-3 sm:my-4 lg:my-5 px-4 sm:px-6 lg:px-8">
            <img
                src={text}
                alt="BUILDstation LEADERBOARD"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full max-w-full object-contain"
            />
            {/* <img src={squares} alt="squares" className="absolute top-56 left-0 w-full animate-bounce" style={{ animationDuration: '10s', animationTimingFunction: 'ease-in-out' }} /> */}
            <img
                src={stars}
                alt="stars"
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-auto h-full max-w-full object-contain animate-bounce"
                style={{ animationDuration: '10s', animationTimingFunction: 'ease-in-out', animationDelay: '2s' }}
            />
        </div>
    )
}