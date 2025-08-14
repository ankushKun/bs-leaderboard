import { useActiveAddress, useApi, useConnection } from "@arweave-wallet-kit/react"
import { connect as aoconnect } from "@permaweb/aoconnect"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Leaderboard from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { fixConnection } from "@wauth/strategy"

type scoreItem = {
  username: string,
  url: string,
  points: number,
  address: string
}

export default function App() {
  const activeAddress = useActiveAddress()
  const { connect, connected, disconnect } = useConnection()
  const api = useApi()
  const ao = aoconnect({ MODE: "legacy", CU_URL: "https://cu.arnode.asia" })
  const [scores, setScores] = useState<scoreItem[]>([])
  const [myTotalScore, setMyTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fixConnection(activeAddress, connected, disconnect)
  }, [activeAddress, connected, disconnect])

  useEffect(() => {
    const getScores = async () => {
      setIsLoading(true)
      try {
        const res = await ao.dryrun({
          process: "EBVZfm0hBV0x30LeWotmEAIKs4XgOT6HgfFeMb1JGlU",
          tags: [
            { name: "Action", value: "Get-Points" }
          ]
        })
        // console.log(JSON.parse(res.Messages[0].Data))
        const data: scoreItem[] = JSON.parse(res.Messages[0].Data)
        console.log(data)
        setScores(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    getScores()
  }, [])

  useEffect(() => {
    if (!connected || !activeAddress) return
    // sum all points for my total score
    const myTotalScore = scores.filter((score) => score.address === activeAddress).reduce((acc, score) => acc + score.points, 0)
    setMyTotalScore(myTotalScore)
  }, [activeAddress, connected, scores])

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-foreground/5 items-center justify-center w-full">
      {/* Header */}
      <Navbar />

      <main className="flex flex-col items-center justify-center p-4 sm:p-5 gap-6 sm:px-6 lg:px-20 grow w-full">

        <div className="w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">BuildStations Scoreboard</h1>
            {isLoading ? (
              <></>
            ) : (
              <>{connected ? <p className="text-muted-foreground">Your Total Score: <span className="font-bold text-primary">{myTotalScore}</span> points</p> : <Button onClick={connect} className="px-8 py-3 text-lg">
                Connect Wallet to see your score
              </Button>}</>
            )}
          </div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Fetching leaderboard data...</p>
            </div>
          ) : (
            <Leaderboard scores={scores} activeAddress={activeAddress} />
          )}
        </div>
      </main>
    </div>
  )
}