# 用打油诗概括 Kimi K3 的技术贡献

一个轻松的 AI 用例：让模型把一份技术架构要点，压缩成一首朗朗上口、便于记忆的**打油诗**。
打油诗形式短、有韵脚、口语化，很适合当作技术要点的助记口诀（mnemonic）。

## 生成的打油诗

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

## 逐句解读

| 诗句 | 对应的技术要点 |
| --- | --- |
| 万亿参数二点八 | 总参数量约 **2.8 万亿**（trillion）。 |
| 八九六选十六家 | MoE 稀疏专家：共 **896** 个专家，每个 token 激活 **16** 个（top-16 routing）。 |
| 三份 KDA 压历史 | 混合注意力中 **3** 份 **KDA**（Kimi Delta Attention，线性注意力）负责压缩、承载长历史。 |
| 一份 MLA 留精华 | 每 3 份 KDA 搭配 **1** 份 **MLA**（Multi-head Latent Attention），保留全局精确注意力的“精华”。 |
| 位置编码全不要 | 采用 **NoPE**（No Positional Encoding），不再显式加位置编码。 |
| 跨层互连有残差 | **跨层连接 / 残差互连**（cross-layer residual connection）。 |
| Muon 动量正交化 | 使用 **Muon** 优化器：对动量做**正交化**（矩阵近似正交化更新）。 |
| 四位权重走天下 | **4-bit（INT4）权重量化**，低比特权重即可部署上线。 |

## 说明与免责

- 这首打油诗是 **AI 生成的创作**，目的是把架构要点写得押韵、好记，而**非**权威技术文档。
- 诗中提到的数字与组件（2.8T 参数、896→16 专家、KDA∶MLA = 3∶1、NoPE、Muon、INT4 等）为该助记口诀中的表述，请以官方发布的技术报告为准，切勿据此引用为事实。
- 收录于本仓库仅作为“让 AI 把技术要点写成打油诗”这一用法的示例。

## Prompt

- 用打油诗的形式，概括 Kimi K3 的技术贡献。
