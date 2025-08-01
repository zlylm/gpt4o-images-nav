/**
 * 分类轮播插件
 * @class CategoryCarousel
 * @description 用于展示不同产品分类的轮播插件，每个分类显示多个产品
 */
class CategoryCarousel {
    constructor(selector, options = {}) {
        // 默认配置
        this.defaults = {
            autoPlay: true,
            autoPlayInterval: 5000,
            infinite: true,
            animationDuration: 800,
            showIndicators: true,
            productsPerPage: 6, // 每页显示的产品数量
            data: {},
            onCategoryChange: null
        };
        
        // 合并配置
        this.options = { ...this.defaults, ...options };
        
        // 获取容器元素
        this.container = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!this.container) {
            throw new Error('轮播容器未找到');
        }
        
        // 初始化属性
        this.categories = Object.keys(this.options.data);
        this.currentIndex = 0;
        this.isAnimating = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;
        
        // 获取DOM元素
        this.initElements();
        
        // 初始化插件
        this.init();
    }
    
    /**
     * 初始化DOM元素引用
     */
    initElements() {
        this.carouselTrack = this.container.querySelector('.carousel-track');
        this.indicatorsContainer = this.container.querySelector('.carousel-indicators');
        this.prevBtn = this.container.querySelector('.prev-btn');
        this.nextBtn = this.container.querySelector('.next-btn');
        this.categoryTitle = this.container.querySelector('.category-title');
    }
    
    /**
     * 初始化插件
     */
    init() {
        // 渲染轮播内容
        this.renderCategories();
        
        // 更新指示器
        this.updateIndicators();
        
        // 更新分类标题
        this.updateCategoryTitle();
        
        // 绑定事件
        this.bindEvents();
        
        // 启动自动播放
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
        
        // 添加触摸支持
        this.initTouchEvents();
        
        console.log('分类轮播插件初始化完成');
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 导航按钮事件
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevCategory());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextCategory());
        }
        
        // 鼠标悬停暂停自动播放
        this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
        this.container.addEventListener('mouseleave', () => {
            if (this.options.autoPlay) {
                this.startAutoPlay();
            }
        });
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.prevCategory();
            } else if (e.key === 'ArrowRight') {
                this.nextCategory();
            }
        });
    }
    
    /**
     * 初始化触摸事件
     */
    initTouchEvents() {
        this.container.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        this.container.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.handleSwipe();
        }, { passive: true });
    }
    
    /**
     * 处理滑动手势
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.nextCategory();
            } else {
                this.prevCategory();
            }
        }
    }
    
    /**
     * 渲染所有分类
     */
    renderCategories() {
        // 清空现有内容
        this.carouselTrack.innerHTML = '';
        
        // 如果启用无限循环，需要克隆首尾元素
        let categoriesToRender = [...this.categories];
        if (this.options.infinite && this.categories.length > 1) {
            // 在开头添加最后一个分类的克隆
            categoriesToRender.unshift(this.categories[this.categories.length - 1]);
            // 在末尾添加第一个分类的克隆
            categoriesToRender.push(this.categories[0]);
        }
        
        // 创建分类页面
        categoriesToRender.forEach((categoryKey, index) => {
            const categoryPage = this.createCategoryPage(categoryKey, index);
            this.carouselTrack.appendChild(categoryPage);
        });
        
        // 设置初始位置
        this.updateCarouselPosition(false);
    }
    
    /**
     * 创建分类页面元素
     * @param {string} categoryKey - 分类键名
     * @param {number} index - 索引
     * @returns {HTMLElement} 分类页面元素
     */
    createCategoryPage(categoryKey, index) {
        const categoryData = this.options.data[categoryKey] || [];
        const categoryPage = document.createElement('div');
        categoryPage.className = 'category-page';
        
        // 创建产品网格
        const productsGrid = document.createElement('div');
        productsGrid.className = 'products-grid';
        
        // 限制显示的产品数量
        const productsToShow = categoryData.slice(0, this.options.productsPerPage);
        
        productsToShow.forEach(product => {
            const productItem = this.createProductItem(product);
            productsGrid.appendChild(productItem);
        });
        
        categoryPage.appendChild(productsGrid);
        return categoryPage;
    }
    
    /**
     * 创建产品项目元素
     * @param {Object} product - 产品数据
     * @returns {HTMLElement} 产品项目元素
     */
    createProductItem(product) {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h4 class="product-name">${product.name}</h4>
                <p class="product-desc">${product.description}</p>
            </div>
        `;
        
        // 添加图片加载错误处理
        // const img = productItem.querySelector('img');
        // img.addEventListener('error', () => {
        //     img.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=图片加载失败';
        // });
        
        return productItem;
    }
    
    /**
     * 更新指示器
     */
    updateIndicators() {
        if (!this.options.showIndicators) return;
        
        // 清空现有指示器
        this.indicatorsContainer.innerHTML = '';
        
        // 创建指示器
        this.categories.forEach((categoryKey, index) => {
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === this.currentIndex ? 'active' : ''}`;
            indicator.innerHTML = `<span>${this.getCategoryDisplayName(categoryKey)}</span>`;
            indicator.addEventListener('click', () => this.goToCategory(index));
            this.indicatorsContainer.appendChild(indicator);
        });
    }
    
    /**
     * 获取分类显示名称
     * @param {string} categoryKey - 分类键名
     * @returns {string} 显示名称
     */
    getCategoryDisplayName(categoryKey) {
        const displayNames = {
            'smart-lighting': '智慧路灯',
            'smart-agriculture': '智慧农业',
            'smart-parking': '智慧停车',
            'smart-water': '智慧水利',
            'smart-city': '智慧城市'
        };
        return displayNames[categoryKey] || categoryKey;
    }
    
    /**
    /**
     * 更新分类标题和背景
     */
    updateCategoryTitle() {
        const currentCategory = this.categories[this.currentIndex];
        const displayName = this.getCategoryDisplayName(currentCategory);
        
        // 更新标题
        if (this.categoryTitle) {
            this.categoryTitle.textContent = displayName;
            
            // 添加淡入动画
            this.categoryTitle.classList.add('fade-in');
            setTimeout(() => {
                this.categoryTitle.classList.remove('fade-in');
            }, 500);
        }
        
        // 更新背景类
        this.updateBackgroundClass(currentCategory);
    }
    
    /**
     * 更新背景类
     * @param {string} categoryKey - 分类键名
     */
    updateBackgroundClass(categoryKey) {
        // 移除所有背景类
        const backgroundClasses = ['smart-lighting', 'smart-agriculture', 'smart-parking', 'smart-water'];
        backgroundClasses.forEach(cls => {
            this.container.classList.remove(cls);
        });
        
        // 添加当前分类的背景类
        this.container.classList.add(categoryKey);
    }
    
    /**
     * 上一个分类
     */
    prevCategory() {
        if (this.isAnimating) return;
        
        if (this.categories.length <= 1) return;
        
        this.currentIndex--;
        
        if (this.currentIndex < 0) {
            if (this.options.infinite) {
                this.currentIndex = this.categories.length - 1;
            } else {
                this.currentIndex = 0;
                return;
            }
        }
        
        this.updateCategory('prev');
    }
    
    /**
     * 下一个分类
     */
    nextCategory() {
        if (this.isAnimating) return;
        
        if (this.categories.length <= 1) return;
        
        this.currentIndex++;
        
        if (this.currentIndex >= this.categories.length) {
            if (this.options.infinite) {
                this.currentIndex = 0;
            } else {
                this.currentIndex = this.categories.length - 1;
                return;
            }
        }
        
        this.updateCategory('next');
    }
    
    /**
     * 跳转到指定分类
     * @param {number} index - 目标索引
     */
    goToCategory(index) {
        if (this.isAnimating || index === this.currentIndex) return;
        
        if (index < 0 || index >= this.categories.length) return;
        
        this.currentIndex = index;
        this.updateCategory();
    }
    
    /**
     * 更新分类显示
     * @param {string} direction - 切换方向
     */
    updateCategory(direction = '') {
        this.isAnimating = true;
        
        // 更新轮播位置
        this.updateCarouselPosition(true);
        
        // 更新指示器
        this.updateIndicatorsState();
        
        // 更新分类标题
        this.updateCategoryTitle();
        
        // 添加切换动画类
        if (direction) {
            this.container.classList.add(`slide-${direction}`);
            setTimeout(() => {
                this.container.classList.remove(`slide-${direction}`);
            }, this.options.animationDuration);
        }
        
        // 动画完成后重置状态
        setTimeout(() => {
            this.isAnimating = false;
        }, this.options.animationDuration);
        
        // 触发回调
        if (this.options.onCategoryChange) {
            const currentCategory = this.categories[this.currentIndex];
            this.options.onCategoryChange(this.currentIndex, currentCategory);
        }
    }
    
    /**
     * 更新轮播位置
     * @param {boolean} animate - 是否使用动画
     */
    updateCarouselPosition(animate = true) {
        let translateX = 0;
        
        if (this.options.infinite && this.categories.length > 1) {
            // 无限循环模式下，实际索引需要偏移1（因为在开头添加了克隆元素）
            translateX = -(this.currentIndex + 1) * 100;
        } else {
            translateX = -this.currentIndex * 100;
        }
        
        // 应用变换
        if (animate) {
            this.carouselTrack.style.transition = `transform ${this.options.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        } else {
            this.carouselTrack.style.transition = 'none';
        }
        
        this.carouselTrack.style.transform = `translateX(${translateX}%)`;
        
        // 处理无限循环的边界情况
        if (this.options.infinite && this.categories.length > 1) {
            setTimeout(() => {
                if (this.currentIndex === this.categories.length - 1 && translateX === -(this.categories.length) * 100) {
                    // 从最后一个真实元素跳转到第一个克隆元素后，立即跳转到第一个真实元素
                    this.carouselTrack.style.transition = 'none';
                    this.carouselTrack.style.transform = `translateX(-100%)`;
                } else if (this.currentIndex === 0 && translateX === 0) {
                    // 从第一个真实元素跳转到最后一个克隆元素后，立即跳转到最后一个真实元素
                    this.carouselTrack.style.transition = 'none';
                    this.carouselTrack.style.transform = `translateX(-${this.categories.length * 100}%)`;
                }
            }, this.options.animationDuration);
        }
    }
    
    /**
     * 更新指示器状态
     */
    updateIndicatorsState() {
        const indicators = this.indicatorsContainer.querySelectorAll('.indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    /**
     * 开始自动播放
     */
    startAutoPlay() {
        this.pauseAutoPlay();
        this.autoPlayTimer = setInterval(() => {
            this.nextCategory();
        }, this.options.autoPlayInterval);
    }
    
    /**
     * 暂停自动播放
     */
    pauseAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }
    
    /**
     * 获取当前状态
     * @returns {Object} 当前状态信息
     */
    getCurrentState() {
        return {
            currentIndex: this.currentIndex,
            currentCategory: this.categories[this.currentIndex],
            isAnimating: this.isAnimating,
            autoPlayActive: !!this.autoPlayTimer,
            totalCategories: this.categories.length
        };
    }
    
    /**
     * 销毁插件
     */
    destroy() {
        // 停止自动播放
        this.pauseAutoPlay();
        
        // 清空容器
        this.carouselTrack.innerHTML = '';
        this.indicatorsContainer.innerHTML = '';
        
        console.log('分类轮播插件已销毁');
    }
}

// 支持多种模块系统
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = CategoryCarousel;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function() {
        return CategoryCarousel;
    });
} else {
    // 全局变量
    window.CategoryCarousel = CategoryCarousel;
}