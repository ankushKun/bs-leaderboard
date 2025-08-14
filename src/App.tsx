import { useActiveAddress, useApi, useConnection } from "@arweave-wallet-kit/react"
import { connect as aoconnect } from "@permaweb/aoconnect"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Leaderboard from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, Zap } from "lucide-react"
import { fixConnection } from "@wauth/strategy"

enum Bucket {
  TWEET = 10,
  THREAD = 25,
  IMAGE = 15,
  VIDEO = 50,
  EDU = 25,
  BUILD = 15,
  COLLAB = 20,
  MEME = 15
}

type scoreItem = {
  username: string
  url: string
  buckets: string // comma separated list of buckets
  points: number // calculated points for this entry
  address: string
}

export default function App() {
  const activeAddress = useActiveAddress()
  const { connect, connected, disconnect } = useConnection()
  const api = useApi()
  const ao = aoconnect({ MODE: "legacy", CU_URL: "https://cu.arnode.asia" })
  const [scores, setScores] = useState<scoreItem[]>([])
  const [myTotalScore, setMyTotalScore] = useState(0)
  const [myRank, setMyRank] = useState<number | undefined>(undefined)
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
    // sum all points for my total score (points are pre-calculated by the Lua process)
    const myTotalScore = scores.filter((score) => score.address === activeAddress).reduce((acc, score) => acc + score.points, 0)
    setMyTotalScore(myTotalScore)

    // Calculate user's rank
    if (scores.length > 0) {
      // Group scores by address and sum up points (same logic as leaderboard)
      const leaderboardData = scores.reduce((acc, score) => {
        const existingEntry = acc.find(entry => entry.address === score.address)
        if (existingEntry) {
          existingEntry.totalPoints += score.points
        } else {
          acc.push({
            username: score.username,
            address: score.address,
            totalPoints: score.points
          })
        }
        return acc
      }, [] as { username: string; address: string; totalPoints: number }[])

      // Sort by total points in descending order
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

      // Find user's rank
      const userRankIndex = leaderboardData.findIndex(entry => entry.address === activeAddress)
      if (userRankIndex !== -1) {
        setMyRank(userRankIndex + 1) // +1 because rank is 1-based
      }
    }
  }, [activeAddress, connected, scores])

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-gradient-to-br from-background via-background to-purple-50/30 dark:to-purple-950/20 items-center justify-center w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <Navbar />

      <main className="flex flex-col items-center justify-center p-4 sm:p-6 gap-8 sm:px-6 lg:px-20 grow w-full relative z-10">

        <div className="w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              {/* <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-float">
                <Trophy className="w-8 h-8 text-white" />
              </div> */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold gradient-text-animate">
                  BuildStations Scoreboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Compete and climb the ranks</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-4">
                {/* <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
                <span className="text-muted-foreground">Loading...</span> */}
              </div>
            ) : (
              <div className="space-y-4">
                {connected ? (
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 shadow-lg hover-lift">
                    <Zap className="w-5 h-5 text-purple-600 animate-bounce-gentle" />
                    <span className="text-muted-foreground">Your Score:</span>
                    <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {myTotalScore}
                    </span>
                    <span className="text-muted-foreground">points</span>
                    {myRank && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">Rank</span>
                        <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          #{myRank}
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={connect}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-200 hover:scale-105"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Connect Wallet to see your score
                  </Button>
                )}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl animate-pulse"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-foreground">Fetching leaderboard data...</p>
                <p className="text-sm text-muted-foreground">This might take a moment</p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <Leaderboard
                scores={scores}
                activeAddress={activeAddress}
                userRank={myRank}
                userTotalPoints={myTotalScore}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}