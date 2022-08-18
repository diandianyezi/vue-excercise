<template>
    <div class="pull-down-refresh">
        <div
            id="scroll-container"
            ref="scrollContainer"
            @touchstart.stop="handleTouchStart"
            @touchmove.stop="handleTouchMove"
            @touchend.stop="handleTouchEnd"
            @scroll="handleScroll"
        >
            <slot name="pull-down-text" v-if="moveDistance">
                <span v-if="showText">{{ text }}</span>
                {{ loadingText }}
            </slot>
            <slot name="content" />
            <slot v-if="showPullUpLoading"> loading... </slot>
        </div>
    </div>
</template>

<script>
import { throttle } from '@/components/uikit/utils';

export default {
    components: {},
    data() {
        return {
            loading: false,
            showText: false,
            showPullUpLoading: false,
            isScrolling: false,
            loadingText: '',
            startLocation: '', // 鼠标点击位置
            moveDistance: 0, // 记录移动位置
            distance: '' // 记录移动距离
        };
    },
    computed: {
        text() {
            return this.moveDistance > 5 ? '下拉刷新' : '松开刷新';
        }
    },
    mounted() {},
    methods: {
        handleTouchStart(e) {
            this.startLocation = e.touches[0].pageY;
        },
        handleTouchMove(e) {
            if (this.isScrolling) return;
            // 获取手指移动距离
            this.moveDistance = Math.floor(
                e.touches[0].pageY - this.startLocation
            );
            this.moveDistance = Math.min(this.moveDistance, 30);
            this.showText = true;
            this.$refs.scrollContainer.style.transform = `translateY(${this.moveDistance}px)`;
        },
        handleTouchEnd(e) {
            if (this.isScrolling) return;
            if (this.moveDistance < 20) return;
            this.showText = false;
            this.loading = true;
            console.info('加载数据...');
            this.loadingText = '正在加载...';
            setTimeout(() => {
                console.info('加载完成');
                this.loadingText = '加载完成';
                setTimeout(() => {
                    this.loadingText = '';
                    this.moveDistance = 0;
                    this.$refs.scrollContainer.style.transform = `translateY(0px)`;
                }, 1000);
            }, 5000);
        },
        handleScroll: (() => {
            return throttle(
                async function (ele) {
                    const {
                        scrollTop,
                        clientHeight,
                        scrollHeight
                    } = ele.target;
                    // this.scrollY = scrollTop;
                    this.isScrolling = scrollTop !== 0;
                    this.$emit('cus-scroll', ele.target);
                    // 划到底部 触发继续加载
                    if (
                        scrollTop + clientHeight >= scrollHeight &&
                        !this.showPullUpLoading
                    ) {
                        this.$emit('load-more');
                        console.info('loading....');
                        this.showPullUpLoading = true;
                        // await this.getUserFootprint(this.eventTime, 20);
                        // this.initScrollBlock();
                    }
                },
                500,
                true
            );
        })()
    }
};
</script>
<style lang="less" scoped>
//@import url(); 引入公共css类
.pull-down-refresh {
    background-color: transparent;
    height: 100%;
    // overflow: auto;
}
#scroll-container {
    background-color: transparent;
    height: 100%;
    overflow: auto;
}
</style>
