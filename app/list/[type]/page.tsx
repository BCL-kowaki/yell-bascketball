"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useParams } from "next/navigation"
import { ensureAmplifyConfigured } from "@/lib/amplifyClient"
import { 
  getCurrentUserEmail, 
  getUserByEmail, 
  getFollowers, 
  getFollowing, 
  getUserFavorites,
  searchUsers,
  searchTeams,
  searchTournaments,
  type DbUser, 
  type DbTeam, 
  type DbTournament 
} from "@/lib/api"
import { Layout } from "@/components/layout"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Search, Users, Trophy, User, Heart } from "lucide-react"
import Link from "next/link"

type ListType = "followers" | "following" | "favorite-teams" | "favorite-tournaments" | "search"

interface PageTitleConfig {
  title: string
  icon: React.ReactNode
}

const PAGE_TITLES: Record<ListType, PageTitleConfig> = {
  "followers": { title: "フォロワー", icon: <Users className="w-5 h-5" /> },
  "following": { title: "フォロー中", icon: <Users className="w-5 h-5" /> },
  "favorite-teams": { title: "お気に入りチーム", icon: <Heart className="w-5 h-5 text-red-500" /> },
  "favorite-tournaments": { title: "お気に入り大会", icon: <Heart className="w-5 h-5 text-red-500" /> },
  "search": { title: "検索結果", icon: <Search className="w-5 h-5" /> },
}

export default function ListPage() {
  ensureAmplifyConfigured()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  
  const type = params.type as ListType
  const userEmail = searchParams.get("user")
  const searchQuery = searchParams.get("q") || ""
  const searchType = searchParams.get("searchType") || "all" // all, users, teams, tournaments
  
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<DbUser | null>(null)
  const [targetUser, setTargetUser] = useState<DbUser | null>(null)
  
  // データ
  const [users, setUsers] = useState<DbUser[]>([])
  const [teams, setTeams] = useState<DbTeam[]>([])
  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  
  // 検索用
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [activeSearchType, setActiveSearchType] = useState(searchType)
  
  useEffect(() => {
    loadData()
  }, [type, userEmail, searchQuery, searchType])
  
  const loadData = async () => {
    setIsLoading(true)
    try {
      // 現在のユーザーを取得
      const email = await getCurrentUserEmail()
      if (email) {
        const userData = await getUserByEmail(email)
        setCurrentUser(userData)
      }
      
      // ターゲットユーザーを取得（userEmailが指定されている場合）
      if (userEmail) {
        const targetUserData = await getUserByEmail(userEmail)
        setTargetUser(targetUserData)
      }
      
      // タイプに応じてデータを取得
      switch (type) {
        case "followers":
          if (userEmail) {
            const followersList = await getFollowers(userEmail)
            setUsers(followersList)
          }
          break
          
        case "following":
          if (userEmail) {
            const followingList = await getFollowing(userEmail)
            setUsers(followingList)
          }
          break
          
        case "favorite-teams":
          if (userEmail) {
            const favorites = await getUserFavorites(userEmail)
            setTeams(favorites.teams)
          }
          break
          
        case "favorite-tournaments":
          if (userEmail) {
            const favorites = await getUserFavorites(userEmail)
            setTournaments(favorites.tournaments)
          }
          break
          
        case "search":
          if (searchQuery) {
            await performSearch(searchQuery, searchType)
          }
          break
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const performSearch = async (query: string, type: string) => {
    if (!query.trim()) return
    
    try {
      if (type === "all" || type === "users") {
        const userResults = await searchUsers(query)
        setUsers(userResults)
      } else {
        setUsers([])
      }
      
      if (type === "all" || type === "teams") {
        const teamResults = await searchTeams(query)
        setTeams(teamResults)
      } else {
        setTeams([])
      }
      
      if (type === "all" || type === "tournaments") {
        const tournamentResults = await searchTournaments(query)
        setTournaments(tournamentResults)
      } else {
        setTournaments([])
      }
    } catch (error) {
      console.error("Search failed:", error)
    }
  }
  
  const handleSearch = () => {
    if (!localSearchQuery.trim()) return
    router.push(`/list/search?q=${encodeURIComponent(localSearchQuery)}&searchType=${activeSearchType}`)
  }
  
  const handleSearchTypeChange = (newType: string) => {
    setActiveSearchType(newType)
    if (localSearchQuery.trim()) {
      router.push(`/list/search?q=${encodeURIComponent(localSearchQuery)}&searchType=${newType}`)
    }
  }
  
  const pageConfig = PAGE_TITLES[type] || { title: "一覧", icon: null }
  
  // ターゲットユーザーの名前を取得
  const getTargetUserName = () => {
    if (targetUser) {
      return `${targetUser.lastName} ${targetUser.firstName}`
    }
    return ""
  }
  
  // ページタイトルを生成
  const getPageTitle = () => {
    if (type === "search") {
      return searchQuery ? `「${searchQuery}」の検索結果` : "検索"
    }
    const userName = getTargetUserName()
    if (userName) {
      return `${userName}の${pageConfig.title}`
    }
    return pageConfig.title
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#F0F2F5]">
        <div className="max-w-2xl mx-auto px-2 py-4">
          {/* ヘッダー */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              {pageConfig.icon}
              <h1 className="text-xl font-bold">{getPageTitle()}</h1>
            </div>
          </div>
          
          {/* 検索ページの場合は検索フォームを表示 */}
          {type === "search" && (
            <Card className="mb-4 border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="検索キーワードを入力..."
                    value={localSearchQuery}
                    onChange={(e) => setLocalSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
                
                <Tabs value={activeSearchType} onValueChange={handleSearchTypeChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">すべて</TabsTrigger>
                    <TabsTrigger value="users">ユーザー</TabsTrigger>
                    <TabsTrigger value="teams">チーム</TabsTrigger>
                    <TabsTrigger value="tournaments">大会</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          {/* ローディング */}
          {isLoading ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">読み込み中...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ユーザー一覧 */}
              {(type === "followers" || type === "following" || (type === "search" && (activeSearchType === "all" || activeSearchType === "users"))) && (
                <div className="mb-6">
                  {type === "search" && users.length > 0 && (
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      ユーザー ({users.length})
                    </h2>
                  )}
                  
                  {users.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          {type === "followers" && "フォロワーがいません"}
                          {type === "following" && "フォロー中のユーザーがいません"}
                          {type === "search" && activeSearchType === "users" && "ユーザーが見つかりませんでした"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <Card 
                          key={user.id} 
                          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/users/${encodeURIComponent(user.email)}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={user.avatar || undefined} />
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">
                                  {user.lastName} {user.firstName}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {user.bio || user.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* チーム一覧 */}
              {(type === "favorite-teams" || (type === "search" && (activeSearchType === "all" || activeSearchType === "teams"))) && (
                <div className="mb-6">
                  {type === "search" && teams.length > 0 && (
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      チーム ({teams.length})
                    </h2>
                  )}
                  
                  {teams.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          {type === "favorite-teams" && "お気に入りチームがありません"}
                          {type === "search" && activeSearchType === "teams" && "チームが見つかりませんでした"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {teams.map((team) => (
                        <Card 
                          key={team.id} 
                          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/teams/${team.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{team.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {team.category && `${team.category} / `}
                                  {team.prefecture || team.region}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* 大会一覧 */}
              {(type === "favorite-tournaments" || (type === "search" && (activeSearchType === "all" || activeSearchType === "tournaments"))) && (
                <div className="mb-6">
                  {type === "search" && tournaments.length > 0 && (
                    <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      大会 ({tournaments.length})
                    </h2>
                  )}
                  
                  {tournaments.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          {type === "favorite-tournaments" && "お気に入り大会がありません"}
                          {type === "search" && activeSearchType === "tournaments" && "大会が見つかりませんでした"}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-2">
                      {tournaments.map((tournament) => (
                        <Card 
                          key={tournament.id} 
                          className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/tournaments/${tournament.regionBlock}/${tournament.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              {tournament.iconUrl ? (
                                <img
                                  src={tournament.iconUrl}
                                  alt={tournament.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Trophy className="w-6 h-6 text-orange-600" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{tournament.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {tournament.category && `${tournament.category} / `}
                                  {tournament.prefecture || tournament.regionBlock}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* 検索で何も見つからなかった場合 */}
              {type === "search" && activeSearchType === "all" && users.length === 0 && teams.length === 0 && tournaments.length === 0 && searchQuery && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      「{searchQuery}」に一致する結果が見つかりませんでした
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

