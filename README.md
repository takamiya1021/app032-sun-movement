<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge)](https://github.com/yourusername/app032-sun-movement)
[![Tests](https://img.shields.io/badge/tests-31%2F32%20passed-brightgreen?style=for-the-badge)](https://github.com/yourusername/app032-sun-movement)
[![PWA](https://img.shields.io/badge/PWA-enabled-blue?style=for-the-badge)](https://github.com/yourusername/app032-sun-movement)
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/yourusername/app032-sun-movement">
    <div style="font-size: 80px;">☀️</div>
  </a>

  <h3 align="center">太陽の動き表示 (Sun Movement Display)</h3>

  <p align="center">
    世界各地の太陽の動きを美しくビジュアル化するWebアプリケーション
    <br />
    <a href="https://github.com/yourusername/app032-sun-movement"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/yourusername/app032-sun-movement">View Demo</a>
    ·
    <a href="https://github.com/yourusername/app032-sun-movement/issues">Report Bug</a>
    ·
    <a href="https://github.com/yourusername/app032-sun-movement/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

「太陽の動き表示」は、世界中の任意の場所と日時における太陽の位置を計算し、直感的なビジュアルで表示するアプリケーションです。

SunCalc.jsによる高精度な天文計算と、Google Gemini AIによるコンテキストに応じた情報生成を組み合わせることで、単なるツールを超えた学習・体験プラットフォームを提供します。白夜や極夜といった特殊な現象も正確に再現し、自宅にいながら世界の空を旅することができます。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![Next][Next.js]][Next-url]
* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![TailwindCSS][TailwindCSS]][TailwindCSS-url]
* [![SunCalc][SunCalc]][SunCalc-url]
* [![Gemini][Gemini]][Gemini-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

ローカル環境でプロジェクトをセットアップする手順です。

### Prerequisites

* Node.js 18.0 or higher
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Google AI StudioでAPIキーを取得 (AI機能を使用する場合)
   [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. リポジトリをクローン
   ```sh
   git clone https://github.com/yourusername/app032-sun-movement.git
   ```
3. 依存パッケージをインストール
   ```sh
   npm install
   ```
4. 開発サーバーを起動
   ```sh
   npm run dev
   ```
5. ブラウザで `http://localhost:3000` を開く

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

### 基本的な使い方

1. **都市の選択**: プリセットされた17都市から選択するか、緯度経度を直接入力します。
2. **日時の設定**: カレンダーとスライダーを使って、確認したい日時を設定します。
3. **シミュレーション**: 時間スライダーを動かすと、太陽の位置と空の色がリアルタイムに変化します。

### AI機能の活用

1. 右上の「⚙️ APIキー設定」からGoogle Gemini APIキーを保存します。
2. 「✨ AI情報を生成」ボタンをクリックすると、その場所・日時に合わせた以下の情報を生成します：
    - 豆知識
    - ユーザーへのメッセージ
    - UV対策アドバイス
    - 撮影アドバイス

### PWAとしてインストール

このアプリはPWAに対応しています。ブラウザのアドレスバーにあるインストールアイコンをクリックすることで、デスクトップアプリやスマホアプリとしてインストールできます。オフラインでも基本的な計算機能は動作します。

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->
## Roadmap

- [x] **Phase 0: 環境構築** (Next.js, TypeScript, Tailwind CSS)
- [x] **Phase 1: 計算ロジック** (SunCalc.js統合, 17都市データ)
- [x] **Phase 2: Canvas描画** (空の色変化, 太陽軌跡, 発光効果)
- [x] **Phase 3: UI実装** (日時選択, 都市選択, 情報表示)
- [x] **Phase 4: AI機能** (Google Gemini API統合)
- [x] **Phase 5: ストレージ** (設定の永続化)
- [x] **Phase 6: PWA対応** (オフライン動作, インストール対応)
- [ ] **Future**: 3D表示モード
- [ ] **Future**: 月の動きの追加

See the [open issues](https://github.com/yourusername/app032-sun-movement/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->
## Contact

クロ (Kuro) - Project Lead

Project Link: [https://github.com/yourusername/app032-sun-movement](https://github.com/yourusername/app032-sun-movement)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [SunCalc.js](https://github.com/mourner/suncalc) - 太陽位置計算ライブラリ
* [Google AI Studio](https://aistudio.google.com/) - Gemini API
* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [React Icons](https://react-icons.github.io/react-icons/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/yourusername/app032-sun-movement/blob/master/LICENSE.txt
[product-screenshot]: public/images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[TypeScript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[TailwindCSS-url]: https://tailwindcss.com/
[SunCalc]: https://img.shields.io/badge/SunCalc-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[SunCalc-url]: https://github.com/mourner/suncalc
[Gemini]: https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white
[Gemini-url]: https://deepmind.google/technologies/gemini/
