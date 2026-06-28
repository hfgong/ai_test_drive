import requests
import json
import openai
import os

# 下载JSON文件
# Download the JSON file
url = "https://raw.githubusercontent.com/fluency03/shijing/master/json/shijing.json"
response = requests.get(url)
shijing_data = response.json()

# 初始化OpenAI API密钥
# Initialize OpenAI API key
openai.api_key = 'your_openai_api_key_here'  # 替换为你的实际OpenAI API密钥 # Replace with your actual OpenAI API key

# 定义保存结果的文件
# Define files to save results
results_file = 'shijing_results.json'
responses_file = 'shijing_responses.json'

# 如果结果文件存在，加载已保存的结果
# Load previously saved results if the results file exists
if os.path.exists(results_file):
    with open(results_file, 'r', encoding='utf-8') as file:
        results = json.load(file)
else:
    results = {}

# 如果响应文件存在，加载已保存的响应
# Load previously saved responses if the responses file exists
if os.path.exists(responses_file):
    with open(responses_file, 'r', encoding='utf-8') as file:
        responses = json.load(file)
else:
    responses = {}

# 定义函数以调用OpenAI API并获取诗中提到的动植物
# Define a function to call the OpenAI API and get animals and plants mentioned in the poem
def get_animals_and_plants(poem_content):
    prompt = (
        "提取以下《诗经》诗句中提到的动物和植物，并以JSON格式返回结果。\n\n"
        "例子：\n"
        "诗：关关雎鸠，在河之洲。窈窕淑女，君子好逑。\n"
        "返回：{\"animals\": [\"雎鸠\"], \"plants\": []}\n\n"
        "诗：\n" + poem_content + "\n"
        "返回："
    )
    response = openai.ChatCompletion.create(
        model="gpt-4",  # 使用GPT-4模型 # Use GPT-4 model
        messages=[
            {"role": "system", "content": "你是一个会识别诗中动植物的助手。"},
            {"role": "user", "content": prompt}
        ],
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.5,
    )
    return response

# 初始化令牌计数器
# Initialize token counter
total_tokens_used = 0

# 处理JSON文件中的每首诗
# Process each poem in the JSON file
for poem_id, poem_data in shijing_data.items():
    if poem_id in results:
        continue  # 如果结果已经存在，跳过此诗 # Skip this poem if the result already exists

    poem_content = "\n".join(poem_data["content"])
    
    # 如果响应已存在，则直接使用已保存的响应
    # Use saved response if it already exists
    if poem_id in responses:
        response_text = responses[poem_id]
    else:
        response = get_animals_and_plants(poem_content)
        total_tokens_used += response['usage']['total_tokens']  # 更新总令牌使用量 # Update total tokens used
        response_text = response['choices'][0]['message']['content'].strip()
        responses[poem_id] = response_text

    # 去除```json和```标记
    # Remove ```json and ``` markers
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]

    try:
        animals_and_plants = json.loads(response_text)
    except json.JSONDecodeError:
        animals_and_plants = {"animals": [], "plants": []}

    results[poem_id] = animals_and_plants

    # 每处理完一首诗就保存结果和原始响应
    # Save results and raw responses after processing each poem
    with open(results_file, 'w', encoding='utf-8') as file:
        json.dump(results, file, ensure_ascii=False, indent=2)

    with open(responses_file, 'w', encoding='utf-8') as file:
        json.dump(responses, file, ensure_ascii=False, indent=2)
    print(poem_id, poem_data['title'])

# 输出结果
# Output the results
print(json.dumps(results, ensure_ascii=False, indent=2))
print(f"总令牌使用量: {total_tokens_used}") # Total tokens used
