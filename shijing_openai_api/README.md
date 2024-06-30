# Shijing Animals and Plants Extractor

This project uses the OpenAI GPT-4o API to automatically extract mentioned animals and plants from each poem in the "Shijing" (Book of Odes).

The code is also generated using CPT-4o interactively.

## Background

The "Shijing" is the earliest anthology of Chinese poetry, containing numerous references to animals and plants. This project aims to leverage AI technology to automatically extract these references for further study and analysis.

## Prompts
* Help me write Python code to first download this json file (https://raw.githubusercontent.com/fluency03/shijing/master/json/shijing.json), then for each poem in this file, call OpenAI API to get animals and plants mentioned in the poem, return response in JSON format.  The input snippet is like the following:
```json{
  "1": {
    "title": "关雎",
    "chapter": "国风",
    "section": "周南",
    "content": [
      "关关雎鸠，在河之洲。窈窕淑女，君子好逑。",
      "参差荇菜，左右流之。窈窕淑女，寤寐求之。",
      "求之不得，寤寐思服。悠哉悠哉，辗转反侧。",
      "参差荇菜，左右采之。窈窕淑女，琴瑟友之。",
      "参差荇菜，左右芼之。窈窕淑女，钟鼓乐之。"
    ]
  },
  "2": {
    "title": "葛覃",
    "chapter": "国风",
    "section": "周南",
    "content": [
      "葛之覃兮，施于中谷，维叶萋萋。黄鸟于飞，集于灌木，其鸣喈喈。",
      "葛之覃兮，施于中谷，维叶莫莫。是刈是濩，为絺为绤，服之无斁。",
      "言告师氏，言告言归。薄污我私，薄浣我衣。害浣害否，归宁父母。"
    ]
  },
  "3": {
    "title": "卷耳",
    "chapter": "国风",
    "section": "周南",
    "content": [
      "采采卷耳，不盈顷筐。嗟我怀人，置彼周行。",
      "陟彼崔嵬，我马虺隤。我姑酌彼金罍，维以不永怀。",
      "陟彼高冈，我马玄黄。我姑酌彼兕觥，维以不永伤。",
      "陟彼砠矣，我马瘏矣，我仆痡矣，云何吁矣。"
    ]
  },
```
The output of GPT-4o call is like the following
```json
{
"animals": ["马"],
"plants": ["卷耳"]
}
```
* 为节省budget，每次都保存结果，这样崩溃之后可以继续，不用浪费budget
* Sometimes the output is enclosed with \```json and \```, like the following, change the code to be able to process that, also make use of the existing response without re-call OpenAi API again.
"\```
json\n{\n    \"animals\": [\"豕\"],\n    \"plants\": []\n}\n
\```"

## Features

- Automatically downloads the "Shijing" JSON file
- Uses the OpenAI GPT-4 API to extract animals and plants mentioned in each poem
- Supports resumable operation to save API call costs

## Installation

Before running this code, ensure you have the following Python libraries installed:

```sh
pip install requests openai
```

## Acknowledgement

The Shijing JSON file is downloaded from GitHub repo fluency03/shijing.
