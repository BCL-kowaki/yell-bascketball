"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  Trophy,
  Calendar
} from "lucide-react"
import { Layout } from "@/components/layout"
import { listTournaments, DbTournament } from "@/lib/api"
import { REGION_SLUG_TO_NAME, PREFECTURE_SLUG_TO_NAME } from "@/lib/regionMapping"

export default function PrefectureTournamentsPage() {
  const params = useParams()
  const regionSlug = params.region as string
  const prefectureSlug = params.prefecture as string
  const regionName = REGION_SLUG_TO_NAME[regionSlug]
  const prefectureName = PREFECTURE_SLUG_TO_NAME[prefectureSlug] || prefectureSlug

  const [tournaments, setTournaments] = useState<DbTournament[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (regionName && prefectureName) {
      loadTournaments()
    }
  }, [regionName, prefectureName])

  async function loadTournaments() {
    if (!regionName || !prefectureName) return
    
    try {
      setIsLoading(true)
      const allTournaments = await listTournaments(1000)

      console.log('🔍 Filtering tournaments:', {
        regionName,
        prefectureName,
        totalTournaments: allTournaments.length,
        sampleTournaments: allTournaments.slice(0, 3).map(t => ({
          name: t.name,
          regionBlock: t.regionBlock,
          prefecture: t.prefecture
        }))
      })

      // 指定された地域と都道府県の大会のみフィルター
      const filteredTournaments = allTournaments.filter(
        t => t.regionBlock === regionName && t.prefecture === prefectureName
      )
      
      console.log('✅ Filtered tournaments:', {
        count: filteredTournaments.length,
        tournaments: filteredTournaments.map(t => ({
          id: t.id,
          name: t.name,
          regionBlock: t.regionBlock,
          prefecture: t.prefecture
        }))
      })
      
      setTournaments(filteredTournaments)
    } catch (error) {
      console.error("Failed to load tournaments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!regionName || !prefectureName) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-2 py-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">都道府県が見つかりません</p>
            <Link href="/tournaments">
              <Button className="mt-4">大会トップに戻る</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-2 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href={`/tournaments/${regionSlug}`} className="text-gray-500 hover:text-gray-700">
            {regionName}エリア
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-red-600 font-medium">{prefectureName}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">{prefectureName}の大会</h1>
            </div>
            <p className="text-3xl font-bold text-red-600">{tournaments.length}件</p>
          </div>
        </div>

        {/* Tournaments List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">読み込み中...</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">まだ大会が登録されていません</p>
            <Link href="/tournaments/create">
              <Button className="mt-4">
                新規大会を登録
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
              >
                <Card className="shadow-[0px_1px_2px_1px_rgba(0,0,0,0.15)] hover:shadow-xl transition-all duration-300 cursor-pointer group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg font-bold group-hover:text-red-600 transition-colors">
                        {tournament.name}
                      </CardTitle>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {tournament.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tournament.category}
                      </Badge>
                    )}

                    {tournament.district && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{tournament.district}</span>
                      </div>
                    )}

                    {tournament.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {tournament.description}
                      </p>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>主催: {tournament.ownerEmail}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="text-center mt-12">
          <Link href={`/tournaments/${regionSlug}`}>
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              {regionName}エリアに戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

