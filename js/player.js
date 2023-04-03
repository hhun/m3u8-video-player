let demo_video_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

var art;
var video_url = '';
$('.form-control').on('submit', (e) => {
	e.preventDefault();
	let temp_video_url = $('.form-control>.url').val();
	if (temp_video_url == '') {
		layer.msg('请输入视频网址');
		return false;
	}
	if (video_url == temp_video_url) {
		layer.msg('视频网址没有改变');
		art.play();
		return false;
	}
	layer.msg('播放视频');
	video_url = $('.form-control>.url').val();
	playVideo(video_url);
});

$(document).ready(function() {
	let hash = window.location.hash;
	if (hash.startsWith('video_url=', 1)) {
		let temp_video_url = decodeURIComponent(hash.substr(11));
		playVideo(temp_video_url);
	}
});

var playVideo = (videoUrl) => {
	$('.main').removeClass('ready');
	if (videoUrl == '') {
		videoUrl = demo_video_url;
		layer.open({
			icon: 5,
			time: 5 * 1000,
			title: '错误提示',
			content: '请输入m3u8视频地址，当前播放为演示视频。',
			btn: ['知道了']
		});
	}
	if (videoUrl) {
		$('.form-control>.url').val(videoUrl);
		window.location.hash = 'video_url=' + encodeURIComponent(videoUrl);
	}
	//console.log('art:', art)
	if (art?.id) {
		art.destroy();
	}
	try {
		art = new Artplayer({
			container: '.player',
			url: videoUrl,
			title: 'm3u8播放器',
			loop: true, // 区间循序播放
			flip: true, // 画面翻转
			playbackRate: true, // 播放速度
			aspectRatio: true, // 画面比例
			screenshot: true, // 截屏
			setting: true, // 设置
			pip: true, // 画中画
			fullscreenWeb: true, // 网页全屏
			fullscreen: true, // 全屏
			subtitleOffset: true, // 字幕偏移
			miniProgressBar: true, // 迷你进度条
			airplay: true,
			theme: '#23ade5',
			thumbnails: {},
			subtitle: {},
			highlight: [{
				time: 15,
				text: '欢迎使用m3u8播放器',
			}],
			icons: {
				loading: '<img src="images/loading.gif" width="100px" title="视频加载中..." />'
			},
			settings: [{
				html: '控件栏浮动',
				icon: '<img width="22" heigth="22" src="images/state.svg">',
				tooltip: '开启',
				switch: true,
				onSwitch: async (item) => {
					item.tooltip = item.switch ? '关闭' : '开启';
					art.plugins.artplayerPluginControl.enable = !item.switch;
					await Artplayer.utils.sleep(300);
					art.setting.updateStyle();
					return !item.switch;
				},
			}],
			customType: {
				m3u8: playM3u8,
			},
			plugins: [
				artplayerPluginControl(),
				artplayerPluginHlsQuality({
					control: true, // 显示在控制栏
					setting: false, // 显示在设置
					title: 'Quality', // I18n
					auto: 'Auto',
				})
			],
		});
		art.on('ready', () => {
			setTimeout(() => {
				layer.msg('开始播放');
				art.play();
			}, 100);
		});
	} catch (e) {
		console.error('发生异常:', e)
	}
}

var playM3u8 = (video, url, art) => {
	if (Hls.isSupported()) {
		const hls = new Hls();

		art.hls = hls;
		art.hls.loadSource(url);
		art.hls.attachMedia(video);

		art.once('url', () => hls.destroy());
		art.once('destroy', () => hls.destroy());
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		art.switchUrl(url);
		art.seek = 0;
	} else {
		art.notice.show = 'Unsupported playback format: m3u8';
	}
}