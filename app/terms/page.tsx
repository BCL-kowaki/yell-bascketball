"use client"

import Link from "next/link"
import { Layout } from "@/components/layout"
import { ChevronLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4 py-6 pb-20">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          設定に戻る
        </Link>

        <h1 className="text-2xl font-bold mb-6">利用規約</h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月1日</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（適用）</h2>
            <p>
              本利用規約（以下「本規約」）は、YeLL Basketball（以下「本サービス」）の利用に関する条件を定めるものです。
              登録ユーザーの皆さま（以下「ユーザー」）には、本規約に従い本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（利用登録）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスの利用を希望する方は、本規約に同意の上、所定の方法により利用登録を行うものとします。</li>
              <li>利用登録の申請者が以下のいずれかに該当する場合、登録を承認しないことがあります。
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>虚偽の事項を届け出た場合</li>
                  <li>本規約に違反したことがある者からの申請である場合</li>
                  <li>その他、登録を相当でないと判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（アカウント管理）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーは、自己の責任においてアカウント情報（メールアドレス・パスワード等）を管理するものとします。</li>
              <li>ユーザーは、アカウントを第三者に譲渡・貸与することはできません。</li>
              <li>アカウント情報の管理不十分、第三者の使用等による損害の責任はユーザーが負うものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（禁止事項）</h2>
            <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスのサーバーまたはネットワークの機能を破壊・妨害する行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集・蓄積する行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>他のユーザーに成りすます行為</li>
              <li>本サービスに関連して、反社会的勢力に対して直接・間接に利益を供与する行為</li>
              <li>他のユーザーまたは第三者の知的財産権、肖像権、プライバシー、名誉その他の権利・利益を侵害する行為</li>
              <li>過度に暴力的な表現、性的な表現、差別につながる表現、反社会的な内容を含む表現を投稿・送信する行為</li>
              <li>営業、宣伝、広告、勧誘その他営利を目的とする行為（当サービスが認めたものを除く）</li>
              <li>面識のない異性との出会いを目的とする行為</li>
              <li>その他、本サービスが不適切と判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（投稿コンテンツ）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーが本サービスに投稿したコンテンツ（テキスト、画像、動画等）の著作権はユーザーに帰属します。</li>
              <li>ユーザーは、投稿コンテンツについて、本サービスが本サービスの改善・宣伝等の目的で無償で利用（複製、翻案、公衆送信等）することを許諾するものとします。</li>
              <li>本サービスは、法令に基づく場合や本規約違反がある場合、投稿コンテンツを削除できるものとします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（サービスの変更・停止）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスは、事前の通知なく、サービス内容を変更・追加・廃止することができるものとします。</li>
              <li>以下の事由がある場合、事前の通知なくサービスの全部・一部の提供を停止・中断できるものとします。
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>サービスに係るシステムの保守・点検を行う場合</li>
                  <li>地震、落雷、火災、停電等の不可抗力により提供が困難な場合</li>
                  <li>その他、運営上サービス提供が困難と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（免責事項）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスは、事実上・法律上の瑕疵（安全性、信頼性、正確性、有用性等に関する欠陥を含む）がないことを明示的にも黙示的にも保証しません。</li>
              <li>本サービスは、ユーザーに生じた損害について一切の責任を負いません。ただし、消費者契約法その他の法令により免責が認められない場合を除きます。</li>
              <li>ユーザー間またはユーザーと第三者との間のトラブルについて、本サービスは一切の責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第8条（退会）</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>ユーザーは、所定の手続きにより、いつでもアカウントを削除して退会することができます。</li>
              <li>退会した場合、ユーザーのアカウント情報および投稿データは削除される場合があります。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第9条（規約の変更）</h2>
            <p>
              本サービスは、必要と判断した場合、ユーザーに通知することなく本規約を変更できるものとします。
              変更後の利用規約は、本サービス上に掲示した時点から効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第10条（準拠法・裁判管轄）</h2>
            <p>
              本規約の解釈にあたっては日本法を準拠法とします。
              本サービスに関して紛争が生じた場合には、本サービスの本店所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
