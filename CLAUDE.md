# CLAUDE.md

このリポジトリの正の規約は [AGENTS.md](AGENTS.md) です。Claude Codeで作業またはレビューする場合も、まずAGENTS.mdを読み、そこにある自走方針、費用ガード、GitHub/Cloudflare運用、報告ルールに従ってください。

## Project reminders

- 生成された `/clock/?c=...` URL がOBS再現性の正です。
- `/clock/` は時計専用面として維持し、透明背景対応を壊さないでください。
- UI、README、Issue/PRの本文は日本語を優先し、配信者に分かる平易な表現にしてください。
- URL、ラベル、フォント名などの未信頼入力はHTMLとして実行せず、既存のsanitize方針を維持してください。
- フォントファイルは同梱しないでください。追加する場合は事前にライセンスを確認し、`docs/licenses`へ記録してください。
- secret、token、OAuth credential、実ユーザー/顧客データを読まない・送らないでください。
