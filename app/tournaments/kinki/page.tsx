"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  ChevronRight,
  ChevronLeft,
  Clock
} from "lucide-react"
import { Layout } from "@/components/layout"

// 近畿地方の都道府県データ
const kinkiPrefectures = [
  {
    id: "shiga",
    name: "滋賀県",
    image: "/placeholder.svg?height=200&width=300&text=滋賀県",
    featured: false,
  },
  {
    id: "kyoto",
    name: "京都府",
    image: "/placeholder.svg?height=200&width=300&text=京都府",
    featured: true,
  },
  {
    id: "osaka",
    name: "大阪府",
    image: "/placeholder.svg?height=200&width=300&text=大阪府",
    featured: true
  },
  {
    id: "hyogo",
    name: "兵庫県",
    image: "/placeholder.svg?height=200&width=300&text=兵庫県",
    featured: true
  },
  {
    id: "nara",
    name: "奈良県",
    image: "/placeholder.svg?height=200&width=300&text=奈良県",
    featured: false
  },
  {
    id: "wakayama",
    name: "和歌山県",
    image: "/placeholder.svg?height=200&width=300&text=和歌山県",
    featured: false
  }
]

export default function KinkiPage() {
  return (
    <Layout isLoggedIn={true} currentUser={{ name: "ユーザー" }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/tournaments" className="text-gray-500 hover:text-gray-700">
            大会トップ
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-red-600 font-medium">近畿エリア</span>
        </div>
        {/* Header */}
        {/* Statistics */}
        {/* All Prefectures - Unified Layout */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">近畿エリア</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kinkiPrefectures.map((prefecture) => (
              <Link key={prefecture.id} href={`/tournaments/kinki/${prefecture.id}`}>
                <Card className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:scale-105 h-full`}>
                  <div className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-10`}></div>
                    <img 
                      src={prefecture.image} 
                      alt={prefecture.name}
                      className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-xl font-bold`}>
                        {prefecture.name}
                      </CardTitle>
                      <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1">
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>最新更新: 1時間前</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link href="/tournaments">
            <Button variant="outline" className="px-6 py-3">
              <ChevronLeft className="w-4 h-4 mr-2" />
              地域選択に戻る
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}