/**
 * 地域・都道府県・地区の初期データ投入スクリプト
 * 
 * 使用方法:
 * 1. amplify push を実行してテーブルを作成
 * 2. このスクリプトを実行: npx ts-node scripts/seed-regions.ts
 */

import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'
import config from '../src/amplifyconfiguration.json'
import { PREFECTURES_BY_REGION, DISTRICTS_BY_PREFECTURE } from '../lib/regionData'
import { PREFECTURE_NAME_TO_SLUG } from '../lib/regionMapping'
import { createRegion, createPrefecture, createDistrict } from '../src/graphql/mutations'
import { listRegions } from '../src/graphql/queries'

Amplify.configure(config)
const client = generateClient()

// 地域ブロックのデータ
const REGIONS = [
  { name: "北海道", slug: "hokkaido", order: 1 },
  { name: "東北", slug: "tohoku", order: 2 },
  { name: "関東", slug: "kanto", order: 3 },
  { name: "東海", slug: "tokai", order: 4 },
  { name: "北信越", slug: "hokushinetsu", order: 5 },
  { name: "近畿", slug: "kinki", order: 6 },
  { name: "中国", slug: "chugoku", order: 7 },
  { name: "四国", slug: "shikoku", order: 8 },
  { name: "九州・沖縄", slug: "kyushu", order: 9 },
]

async function seedRegions() {
  console.log('🌍 地域ブロックのデータを投入中...')
  
  const regionMap = new Map<string, string>() // name -> id

  for (const region of REGIONS) {
    try {
      const result = await client.graphql({
        query: createRegion,
        variables: {
          input: {
            name: region.name,
            slug: region.slug,
            sortOrder: region.order,
          }
        }
      })

      // @ts-ignore
      const createdRegion = result.data.createRegion
      if (createdRegion) {
        regionMap.set(region.name, createdRegion.id)
        console.log(`✅ ${region.name} を作成しました (ID: ${createdRegion.id})`)
      }
    } catch (error: any) {
      // 既に存在する場合はスキップ
      if (error.errors?.some((e: any) => e.errorType === 'ConditionalCheckFailedException')) {
        console.log(`⚠️ ${region.name} は既に存在します`)
        // 既存のデータを取得
        const listResult = await client.graphql({
          query: listRegions
        })
        // @ts-ignore
        const existing = listResult.data.listRegions?.items?.find((r: any) => r?.name === region.name)
        if (existing) {
          regionMap.set(region.name, existing.id)
        }
      } else {
        console.error(`❌ ${region.name} の作成に失敗:`, error)
      }
    }
  }

  return regionMap
}

async function seedPrefectures(regionMap: Map<string, string>) {
  console.log('\n🏛️ 都道府県のデータを投入中...')
  
  const prefectureMap = new Map<string, string>() // name -> id

  for (const [regionName, regionId] of regionMap.entries()) {
    const prefectures = PREFECTURES_BY_REGION[regionName] || []
    
    for (let i = 0; i < prefectures.length; i++) {
      const prefectureName = prefectures[i]
      const slug = PREFECTURE_NAME_TO_SLUG[prefectureName] || prefectureName.toLowerCase().replace(/[県府都]/g, "")
      
      try {
        const result = await client.graphql({
          query: createPrefecture,
          variables: {
            input: {
              name: prefectureName,
              slug: slug,
              regionId: regionId,
              sortOrder: i + 1,
            }
          }
        })

        // @ts-ignore
        const createdPrefecture = result.data.createPrefecture
        if (createdPrefecture) {
          prefectureMap.set(prefectureName, createdPrefecture.id)
          console.log(`✅ ${prefectureName} を作成しました (ID: ${createdPrefecture.id})`)
        }
      } catch (error: any) {
        console.error(`❌ ${prefectureName} の作成に失敗:`, error)
      }
    }
  }

  return prefectureMap
}

async function seedDistricts(prefectureMap: Map<string, string>) {
  console.log('\n🏘️ 地区のデータを投入中...')
  
  let count = 0

  for (const [prefectureName, prefectureId] of prefectureMap.entries()) {
    const districts = DISTRICTS_BY_PREFECTURE[prefectureName] || []
    
    for (let i = 0; i < districts.length; i++) {
      const districtName = districts[i]
      
      try {
        await client.graphql({
          query: createDistrict,
          variables: {
            input: {
              name: districtName,
              prefectureId: prefectureId,
              sortOrder: i + 1,
            }
          }
        })

        count++
        if (count % 50 === 0) {
          console.log(`✅ ${count}件の地区を作成しました...`)
        }
      } catch (error: any) {
        console.error(`❌ ${prefectureName} - ${districtName} の作成に失敗:`, error)
      }
    }
  }

  console.log(`\n✅ 合計 ${count}件の地区を作成しました`)
}

async function main() {
  try {
    console.log('🚀 地域データの投入を開始します...\n')
    
    const regionMap = await seedRegions()
    const prefectureMap = await seedPrefectures(regionMap)
    await seedDistricts(prefectureMap)
    
    console.log('\n✨ すべてのデータ投入が完了しました！')
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

main()

