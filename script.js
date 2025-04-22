// 从 markdown 文件中提取案例数据
async function fetchCases() {
    try {
        const response = await fetch('gpt4o-nav.md');
        const text = await response.text();
        return parseCases(text);
    } catch (error) {
        console.error('Error fetching cases:', error);
        return [];
    }
}

// 解析 markdown 内容
function parseCases(markdown) {
    const cases = [];
    const caseRegex = /## 案例 (\d+):([^(]+)\(([^)]+)\)/g;
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    const promptRegex = /```\n([\s\S]+?)\n```/g;

    let match;
    let currentCase = null;
    let currentContent = '';

    // 分割 markdown 内容
    const sections = markdown.split('## 案例');
    sections.shift(); // 移除第一个空部分

    sections.forEach(section => {
        const lines = section.split('\n');
        const titleMatch = lines[0].match(/^(\d+):([^(]+)\(([^)]+)\)/);
        
        if (titleMatch) {
            if (currentCase) {
                cases.push(currentCase);
            }
            
            currentCase = {
                number: titleMatch[1],
                title: titleMatch[2].trim(),
                author: titleMatch[3].trim(),
                image: '',
                prompt: ''
            };
            
            currentContent = '';
        }

        if (currentCase) {
            // 查找图片
            const imageMatch = section.match(/<img[^>]+src="([^"]+)"[^>]*>/);
            if (imageMatch) {
                currentCase.image = `https://raw.githubusercontent.com/jamez-bondos/awesome-gpt4o-images/main${imageMatch[1]}`;
            }

            // 查找提示词
            const promptMatch = section.match(/```\n([\s\S]+?)\n```/);
            if (promptMatch) {
                currentCase.prompt = promptMatch[1].trim();
            }
        }
    });

    if (currentCase) {
        cases.push(currentCase);
    }

    return cases;
}

// 渲染案例到页面
function renderCases(cases) {
    const container = document.getElementById('casesContainer');
    container.innerHTML = '';

    cases.forEach(caseData => {
        const caseElement = document.createElement('div');
        caseElement.className = 'case-card';
        
        caseElement.innerHTML = `
            <img class="case-image" src="${caseData.image}" alt="${caseData.title}">
            <div class="case-content">
                <h2 class="case-title">案例 ${caseData.number}: ${caseData.title}</h2>
                <div class="case-author">作者: ${caseData.author}</div>
                <div class="case-prompt">${caseData.prompt}</div>
            </div>
        `;
        
        container.appendChild(caseElement);
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    const cases = await fetchCases();
    renderCases(cases);
}); 