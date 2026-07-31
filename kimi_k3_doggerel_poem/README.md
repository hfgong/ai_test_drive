# 用打油诗概括 Kimi K3 的技术贡献 · Summarizing Kimi K3's Contributions as a Doggerel Poem

一个轻松的 AI 用例：让模型把一份技术架构要点，压缩成一首朗朗上口、便于记忆的**打油诗**。
打油诗形式短、有韵脚、口语化，很适合当作技术要点的助记口诀（mnemonic）。

*A light-hearted AI use case: have the model compress a set of technical architecture
points into a catchy, easy-to-remember **doggerel poem** (打油诗). The form is short,
rhymed, and colloquial — a natural mnemonic for a list of technical facts.*

## 生成的打油诗 · The Generated Poem

### 《Kimi K3 技术贡献》

> 万亿参数二点八，
> 八九六选十六家。
> 三份 KDA 压历史，
> 一份 MLA 留精华。
> 位置编码全不要，
> 跨层互连有残差。
> Muon 动量正交化，
> 四位权重走天下。

### *Kimi K3 — What It Brought* (English)

> Two-point-eight trillion weights in all,
> Sixteen of eight-ninety-six answer the call.
> Three parts KDA to squeeze the past,
> One part MLA keeps the gist steadfast.
> Positional codes? We toss them away —
> Cross-layer residuals bridge the way.
> Muon marches, its momentum made square,
> Four-bit weights, and it's out everywhere.

## 逐句解读 · Line-by-Line Notes

| 诗句 (Line) | 英文对照 (Translation) | 对应的技术要点 (Technical point) |
| --- | --- | --- |
| 万亿参数二点八 | Two-point-eight trillion weights in all | 总参数量约 **2.8 万亿**（trillion）。<br>~**2.8 trillion** total parameters. |
| 八九六选十六家 | Sixteen of eight-ninety-six answer the call | MoE 稀疏专家：共 **896** 个专家，每个 token 激活 **16** 个（top-16 routing）。<br>Sparse MoE: **896** experts total, **16** activated per token (top-16 routing). |
| 三份 KDA 压历史 | Three parts KDA to squeeze the past | 混合注意力中 **3** 份 **KDA**（Kimi Delta Attention，线性注意力）负责压缩、承载长历史。<br>In the hybrid attention, **3** parts **KDA** (Kimi Delta Attention, linear attention) compress and carry the long history. |
| 一份 MLA 留精华 | One part MLA keeps the gist steadfast | 每 3 份 KDA 搭配 **1** 份 **MLA**（Multi-head Latent Attention），保留全局精确注意力的“精华”。<br>Every 3 parts KDA pair with **1** part **MLA** (Multi-head Latent Attention) — a 3∶1 layer ratio — keeping the "essence" of exact global attention. |
| 位置编码全不要 | Positional codes? We toss them away | 采用 **NoPE**（No Positional Encoding），不再显式加位置编码。<br>Uses **NoPE** (No Positional Encoding) — no explicit positional encoding. |
| 跨层互连有残差 | Cross-layer residuals bridge the way | **跨层连接 / 残差互连**（cross-layer residual connection）。<br>**Cross-layer residual connections.** |
| Muon 动量正交化 | Muon marches, its momentum made square | 使用 **Muon** 优化器：对动量做**正交化**（矩阵近似正交化更新）。<br>Uses the **Muon** optimizer: **orthogonalizes** the momentum (approximately-orthogonal matrix updates). |
| 四位权重走天下 | Four-bit weights, and it's out everywhere | **4-bit（INT4）权重量化**，低比特权重即可部署上线。<br>**4-bit (INT4) weight quantization** — low-bit weights are enough to ship. |

## 说明与免责 · Notes & Disclaimer

- 这首打油诗是 **AI 生成的创作**，目的是把架构要点写得押韵、好记，而**非**权威技术文档。<br>
  This poem is an **AI-generated creation** meant to make the points rhyme and stick — **not** an authoritative technical document.
- 诗中提到的数字与组件（2.8T 参数、896→16 专家、KDA∶MLA = 3∶1、NoPE、Muon、INT4 等）为该助记口诀中的表述，请以官方发布的技术报告为准，切勿据此引用为事实。<br>
  The figures and components it names (2.8T params, 896→16 experts, KDA∶MLA = 3∶1, NoPE, Muon, INT4, etc.) are as stated in the mnemonic; defer to the official technical report and do not cite them as fact.
- 收录于本仓库仅作为“让 AI 把技术要点写成打油诗”这一用法的示例。<br>
  Included here purely as an example of the "have AI turn technical points into a doggerel poem" use case.

## Prompt

- 用打油诗的形式，概括 Kimi K3 的技术贡献。<br>
  *Summarize Kimi K3's technical contributions in the form of a doggerel poem.*
