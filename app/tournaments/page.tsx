"use client"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Calendar,
  ChevronRight
} from "lucide-react"
import { Layout } from "@/components/layout"

// 地域データ
const regions = [
  {
    id: "hokkaido",
    name: "北海道エリア",
    prefectures: ["北海道"],
    image: "/placeholder.svg?height=200&width=400&text=北海道"
  },
  {
    id: "tohoku",
    name: "東北エリア", 
    prefectures: ["青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"],
    image: "/placeholder.svg?height=200&width=400&text=東北"
  },
  {
    id: "kanto",
    name: "関東エリア",
    prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"],
    image: "/placeholder.svg?height=200&width=400&text=関東"
  },
  {
    id: "hokushinetsu",
    name: "北信越エリア",
    prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県"],
    image: "/placeholder.svg?height=200&width=400&text=北信越"
  },
  {
    id: "tokai",
    name: "東海エリア",
    prefectures: ["岐阜県", "静岡県", "愛知県", "三重県"],
    image: "/placeholder.svg?height=200&width=400&text=東海"
  },
  {
    id: "kinki",
    name: "近畿エリア",
    prefectures: ["滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"],
    image: "/placeholder.svg?height=200&width=400&text=近畿"
  },
  {
    id: "chugoku",
    name: "中国エリア",
    prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県"],
    image: "/placeholder.svg?height=200&width=400&text=中国"
  },
  {
    id: "shikoku",
    name: "四国エリア",
    prefectures: ["徳島県", "香川県", "愛媛県", "高知県"],
    image: "/placeholder.svg?height=200&width=400&text=四国"
  },
  {
    id: "kyushu",
    name: "九州エリア",
    prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"],
    image: "/placeholder.svg?height=200&width=400&text=九州"
  }
]

export default function TournamentsPage() {
  return (
    <Layout>

      <div className="max-w-7xl mx-auto pt-2 pb-20 px-2 md:px-6">
        {/* Header */}
        {/* Statistics */}
        {/* Regions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => {
            return (
              <Link key={region.id} href={`/tournaments/${region.id}`}>
                <Card className={`border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:scale-105`}>
                  <div className="relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-10`}></div>
                    <img 
                      src={region.image} 
                      alt={region.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-xl font-bold`}>
                        {region.name}
                      </CardTitle>
                      <ChevronRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Prefecture Count */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {region.prefectures.length}都道府県
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {region.prefectures.slice(0, 3).map((pref, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pref.replace(/[都道府県]/g, '')}
                          </Badge>
                        ))}
                        {region.prefectures.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{region.prefectures.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* Statistics */}
                    {/* Recent Activity */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>最新更新: 2時間前</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Bottom Info */}
        {/* <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">大会主催者の皆様へ</h3>
            <p className="text-gray-600 text-sm mb-4">
              新しい大会の登録や既存大会の管理は、各地域ページからアクセスできます。<br />
              多くのチームが参加できる素晴らしい大会を一緒に作り上げましょう！
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">大会主催者</Badge>
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">クラブチーム</Badge>
              <Badge className="bg-gradient-to-r from-green-500 to-teal-500 text-white">ゲスト</Badge>
            </div>
          </div>
        </div> */}
      </div>
    </Layout>
  )
}