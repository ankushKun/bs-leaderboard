import { useActiveAddress, useApi, useConnection } from "@arweave-wallet-kit/react"
import { connect as aoconnect } from "@permaweb/aoconnect"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"
import Leaderboard from "@/components/leaderboard"
import { Button } from "@/components/ui/button"
import { Loader2, Trophy, Zap } from "lucide-react"
import { fixConnection } from "@wauth/strategy"
import Hero from "./components/hero"

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
  twitterUsername?: string // Twitter username (optional)
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
  const [xUsername, setXUsername] = useState<string | undefined>(undefined)

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
    if (!connected || !activeAddress || !api) return

    const username = api.getUsername ? api.getUsername() : undefined
    console.log('Username:', username)
    console.log('Address:', activeAddress)

    // Don't disconnect if no username - user might be using regular Arweave wallet
    // Only disconnect if there's an error or invalid connection
    if (!username && api.id == "wauth-twitter") {
      console.log('No username found - user might be using regular Arweave wallet')
      disconnect()
    }

    setXUsername(username)

    // Calculate total score and rank using the same logic as the leaderboard
    if (scores.length > 0) {
      // Group scores by username (Twitter username if available, otherwise regular username) - same logic as leaderboard
      const leaderboardData = scores.reduce((acc, score) => {
        // Extract Twitter username using the same logic as leaderboard
        const extractTwitterUsername = (username: string, twitterUsername?: string): string | null => {
          if (twitterUsername) {
            return twitterUsername.startsWith('@') ? twitterUsername : `@${twitterUsername}`
          }
          if (username.startsWith('@')) {
            return username
          }
          if (username.includes('twitter.com/') || username.includes('x.com/')) {
            const match = username.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/)
            return match ? `@${match[1]}` : null
          }
          return null
        }

        const twitterUsername = extractTwitterUsername(score.username, score.twitterUsername)
        const groupKey = twitterUsername || score.username

        const existingEntry = acc.find(entry => {
          const entryTwitterUsername = extractTwitterUsername(entry.username, entry.twitterUsername)
          const entryGroupKey = entryTwitterUsername || entry.username
          return entryGroupKey === groupKey
        })

        if (existingEntry) {
          existingEntry.totalPoints += score.points
        } else {
          acc.push({
            username: score.username,
            twitterUsername: score.twitterUsername,
            address: score.address,
            totalPoints: score.points
          })
        }
        return acc
      }, [] as { username: string; twitterUsername?: string; address: string; totalPoints: number }[])

      // Sort by total points in descending order
      leaderboardData.sort((a, b) => b.totalPoints - a.totalPoints)

      // Find user's entry by matching address or username
      const userEntry = leaderboardData.find(entry => {
        // First try to match by address
        if (entry.address === activeAddress) return true

        // If no address match, try to match by username (for X users)
        if (username && entry.username === username) return true

        // For X users, also check if the entry's username matches the X username
        if (username && entry.username.includes(username.replace('@', ''))) return true

        return false
      })

      if (userEntry) {
        setMyTotalScore(userEntry.totalPoints)
        const userRankIndex = leaderboardData.findIndex(entry => entry === userEntry)
        setMyRank(userRankIndex + 1) // +1 because rank is 1-based
      } else {
        // Fallback: sum all points for the address if no match found
        const fallbackScore = scores.filter((score) => score.address === activeAddress).reduce((acc, score) => acc + score.points, 0)
        setMyTotalScore(fallbackScore)

        // Find rank for fallback score
        const fallbackRankIndex = leaderboardData.findIndex(entry => entry.totalPoints <= fallbackScore)
        setMyRank(fallbackRankIndex !== -1 ? fallbackRankIndex + 1 : undefined)
      }
    }
  }, [activeAddress, connected, scores])

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-gradient-to-br from-background via-background to-orange-50/30 dark:to-orange-950/20 items-center justify-center w-full relative overflow-hidden">


      {/* Header */}
      <Navbar xUsername={xUsername} isConnected={connected} activeAddress={activeAddress} />


      <main className="flex flex-col items-center justify-center p-4 sm:p-6 gap-8 sm:px-6 lg:px-20 grow w-full relative z-10">

        <div className="flex items-center justify-center w-full">
          <Hero
            xUsername={xUsername}
            userPoints={myTotalScore}
            userRank={myRank}
            isConnected={connected}
            activeAddress={activeAddress}
          />
        </div>

        {/* Rules Section */}
        <div className="w-full max-w-7xl mx-auto my-0 -mt-2">
          <div className="flex justify-center">
            <img
              src="/rules.png"
              alt="Leaderboard Rules - How to earn XP points"
              className="w-full max-w-3xl h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="w-full block relative">
          <div className="text-center space-y-4">

            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                {/* <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-spin"></div>
                <span className="text-muted-foreground">Loading...</span> */}
              </div>
            ) : (
              <div className="space-y-4">
                {!connected && (
                  <Button
                    onClick={connect}
                    className="px-8 py-4 mb-12 text-lg bg-[#f59b30] text-white border-0 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 hover:scale-105"
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
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-lg shadow-orange-500/25 animate-pulse">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-orange-500/20 to-green-500/20 rounded-3xl blur-xl animate-pulse"></div>
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