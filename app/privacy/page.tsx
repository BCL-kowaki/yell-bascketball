"use client"

import Link from "next/link"
import { Layout } from "@/components/layout"
import { ChevronLeft } from "lucide-react"

export default function PrivacyPage() {
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

        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>
        <p className="text-sm text-gray-500 mb-8">最終更新日: 2025年1月1日</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. はじめに</h2>
            <p>
              YeLL Basketball（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーは、本サービスが取得・利用する情報の取り扱いについて定めるものです。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. 取得する情報</h2>
            <p className="mb-3">本サービスは、以下の情報を取得する場合があります。</p>

            <h3 className="font-bold text-gray-800 mb-2">2.1 ユーザーが提供する情報</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>メールアドレス</li>
              <li>パスワード（暗号化して保存）</li>
              <li>氏名・ユーザー名</li>
              <li>都道府県</li>
              <li>プロフィール情報（自己紹介文、プロフィール画像等）</li>
              <li>投稿コンテンツ（テキスト、画像、動画等）</li>
            </ul>

            <h3 className="font-bold text-gray-800 mb-2">2.2 自動的に取得する情報</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>位置情報（GPSによる現在地の取得。大会検索の利便性向上に使用）</li>
              <li>端末情報（OS、ブラウザの種類等）</li>
              <li>アクセスログ（IPアドレス、アクセス日時、閲覧ページ等）</li>
              <li>Cookie情報</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. 情報の利用目的</h2>
            <p className="mb-2">取得した情報は、以下の目的で利用します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供・運営・維持</li>
              <li>ユーザーの本人確認・認証</li>
              <li>大会情報の表示・検索機能の提供（位置情報に基づく最寄り地域の表示等）</li>
              <li>ユーザーサポートへの対応</li>
              <li>利用規約に違反する行為への対応</li>
              <li>サービスの改善・新機能の開発</li>
              <li>統計データの作成（個人を特定できない形式）</li>
              <li>重要なお知らせの配信</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. 情報の第三者提供</h2>
            <p className="mb-2">本サービスは、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供しません。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護に必要な場合であって、ユーザーの同意を得ることが困難な場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進に特に必要な場合</li>
              <li>国の機関・地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに協力する必要がある場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. 外部サービスの利用</h2>
            <p className="mb-2">本サービスは、以下の外部サービスを利用しています。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Amazon Web Services (AWS)</strong>: データの保存・処理・認証基盤として利用</li>
              <li><strong>Amazon Cognito</strong>: ユーザー認証・アカウント管理に利用</li>
            </ul>
            <p className="mt-2">
              これらのサービスには、各サービス事業者のプライバシーポリシーが適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. 情報の安全管理</h2>
            <p>
              本サービスは、個人情報の漏えい、紛失、改ざん等を防止するため、適切なセキュリティ対策を実施します。
              パスワードは暗号化して保存し、通信はSSL/TLSにより暗号化しています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. 位置情報の取り扱い</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>本サービスは、最寄りの大会情報を表示するため、ブラウザのGeolocation APIを通じて位置情報を取得する場合があります。</li>
              <li>位置情報の取得にはユーザーのブラウザでの許可が必要です。</li>
              <li>取得した位置情報はサーバーに保存せず、大会の検索・表示にのみ利用します。</li>
              <li>位置情報の提供を拒否した場合でも、手動で地域を選択してサービスを利用できます。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Cookieの利用</h2>
            <p>
              本サービスは、ユーザーのログイン状態の維持や利便性の向上のためにCookieを利用します。
              ブラウザの設定によりCookieを無効にすることができますが、一部のサービス機能が利用できなくなる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. ユーザーの権利</h2>
            <p className="mb-2">ユーザーは、以下の権利を有します。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>アクセス権</strong>: 自身の個人情報の開示を請求できます</li>
              <li><strong>訂正権</strong>: 不正確な個人情報の訂正を請求できます</li>
              <li><strong>削除権</strong>: アカウントの削除とともに個人情報の削除を請求できます</li>
              <li><strong>データポータビリティ</strong>: 自身の個人情報を持ち出す権利があります</li>
            </ul>
            <p className="mt-2">
              これらの権利の行使を希望する場合は、設定画面からアカウントの管理を行うか、お問い合わせください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. 未成年者の利用</h2>
            <p>
              本サービスは、未成年者の利用を制限していませんが、16歳未満の方は保護者の同意を得た上で利用されることを推奨します。
              未成年者の個人情報について、保護者から削除の申し出があった場合は速やかに対応します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. プライバシーポリシーの変更</h2>
            <p>
              本サービスは、法令の改正やサービス内容の変更等に伴い、本プライバシーポリシーを変更することがあります。
              変更後のプライバシーポリシーは、本サービス上に掲示した時点から効力を生じるものとします。
              重大な変更がある場合は、本サービス上で通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. お問い合わせ</h2>
            <p>
              本プライバシーポリシーに関するお問い合わせは、本サービス内のお問い合わせ機能よりご連絡ください。
            </p>
          </section>
        </div>
      </div>
    </Layout>
  )
}
