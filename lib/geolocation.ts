// 緯度経度から都道府県を判定するユーティリティ
// 各都道府県の代表的な緯度経度範囲（おおまかな矩形）

type PrefectureGeo = {
  name: string        // 都道府県名（例: "東京都"）
  region: string      // 地域ブロック名（例: "関東"）
  lat: number         // 中心緯度
  lng: number         // 中心経度
}

// 全47都道府県の代表座標と所属地域
const PREFECTURE_COORDS: PrefectureGeo[] = [
  // 北海道
  { name: "北海道", region: "北海道", lat: 43.06, lng: 141.35 },
  // 東北
  { name: "青森県", region: "東北", lat: 40.82, lng: 140.74 },
  { name: "岩手県", region: "東北", lat: 39.70, lng: 141.15 },
  { name: "宮城県", region: "東北", lat: 38.27, lng: 140.87 },
  { name: "秋田県", region: "東北", lat: 39.72, lng: 140.10 },
  { name: "山形県", region: "東北", lat: 38.24, lng: 140.34 },
  { name: "福島県", region: "東北", lat: 37.75, lng: 140.47 },
  // 関東
  { name: "茨城県", region: "関東", lat: 36.34, lng: 140.45 },
  { name: "栃木県", region: "関東", lat: 36.57, lng: 139.88 },
  { name: "群馬県", region: "関東", lat: 36.39, lng: 139.06 },
  { name: "埼玉県", region: "関東", lat: 35.86, lng: 139.65 },
  { name: "千葉県", region: "関東", lat: 35.61, lng: 140.12 },
  { name: "東京都", region: "関東", lat: 35.68, lng: 139.69 },
  { name: "神奈川県", region: "関東", lat: 35.45, lng: 139.64 },
  // 北信越
  { name: "新潟県", region: "北信越", lat: 37.90, lng: 139.02 },
  { name: "富山県", region: "北信越", lat: 36.70, lng: 137.21 },
  { name: "石川県", region: "北信越", lat: 36.59, lng: 136.63 },
  { name: "福井県", region: "北信越", lat: 36.07, lng: 136.22 },
  { name: "長野県", region: "北信越", lat: 36.23, lng: 138.18 },
  // 山梨は関東に入れるパターンもあるが、ここでは北信越寄りに近いため関東に
  { name: "山梨県", region: "関東", lat: 35.66, lng: 138.57 },
  // 東海
  { name: "岐阜県", region: "東海", lat: 35.39, lng: 136.72 },
  { name: "静岡県", region: "東海", lat: 34.98, lng: 138.38 },
  { name: "愛知県", region: "東海", lat: 35.18, lng: 136.91 },
  { name: "三重県", region: "東海", lat: 34.73, lng: 136.51 },
  // 近畿
  { name: "滋賀県", region: "近畿", lat: 35.00, lng: 135.87 },
  { name: "京都府", region: "近畿", lat: 35.02, lng: 135.76 },
  { name: "大阪府", region: "近畿", lat: 34.69, lng: 135.52 },
  { name: "兵庫県", region: "近畿", lat: 34.69, lng: 135.18 },
  { name: "奈良県", region: "近畿", lat: 34.69, lng: 135.83 },
  { name: "和歌山県", region: "近畿", lat: 34.23, lng: 135.17 },
  // 中国
  { name: "鳥取県", region: "中国", lat: 35.50, lng: 134.24 },
  { name: "島根県", region: "中国", lat: 35.47, lng: 133.05 },
  { name: "岡山県", region: "中国", lat: 34.66, lng: 133.93 },
  { name: "広島県", region: "中国", lat: 34.40, lng: 132.46 },
  { name: "山口県", region: "中国", lat: 34.19, lng: 131.47 },
  // 四国
  { name: "徳島県", region: "四国", lat: 34.07, lng: 134.56 },
  { name: "香川県", region: "四国", lat: 34.34, lng: 134.04 },
  { name: "愛媛県", region: "四国", lat: 33.84, lng: 132.77 },
  { name: "高知県", region: "四国", lat: 33.56, lng: 133.53 },
  // 九州・沖縄
  { name: "福岡県", region: "九州・沖縄", lat: 33.61, lng: 130.42 },
  { name: "佐賀県", region: "九州・沖縄", lat: 33.25, lng: 130.30 },
  { name: "長崎県", region: "九州・沖縄", lat: 32.74, lng: 129.87 },
  { name: "熊本県", region: "九州・沖縄", lat: 32.79, lng: 130.74 },
  { name: "大分県", region: "九州・沖縄", lat: 33.24, lng: 131.61 },
  { name: "宮崎県", region: "九州・沖縄", lat: 31.91, lng: 131.42 },
  { name: "鹿児島県", region: "九州・沖縄", lat: 31.56, lng: 130.56 },
  { name: "沖縄県", region: "九州・沖縄", lat: 26.34, lng: 127.80 },
]

// 2点間の距離（簡易計算、km）
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// 緯度経度から最も近い都道府県を返す
export function getNearestPrefecture(lat: number, lng: number): { prefecture: string; region: string } {
  let nearest = PREFECTURE_COORDS[0]
  let minDist = Infinity

  for (const pref of PREFECTURE_COORDS) {
    const dist = distanceKm(lat, lng, pref.lat, pref.lng)
    if (dist < minDist) {
      minDist = dist
      nearest = pref
    }
  }

  return { prefecture: nearest.name, region: nearest.region }
}

// ブラウザのGeolocation APIで現在地を取得
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // 5分キャッシュ
      }
    )
  })
}
