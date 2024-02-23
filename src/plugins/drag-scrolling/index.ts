import { Slider } from '../../core/types';

const DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK = 20;

export type DragScrollingOptions = {
	draggedDistanceThatPreventsClick: number,
};

export default function DragScrollingPlugin( args: { [key: string]: any } ) {
	const options = <DragScrollingOptions>{
		draggedDistanceThatPreventsClick: args?.draggedDistanceThatPreventsClick ?? DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK,
	};
	return ( slider: Slider ) => {
		let isMouseDown = false;
		let startX = 0;
		let scrollLeft = 0;

		// add data attribute to container
		slider.container.setAttribute( 'data-has-drag-scrolling', 'true' );

		const mouseDown = (e: MouseEvent) => {
			if ( ! slider.details.hasOverflow ) {
				return;
			}
			if ( ! slider.container.contains( e.target as Node ) ) {
				return;
			}

			isMouseDown = true;
			startX = e.pageX - slider.container.offsetLeft;
			scrollLeft = slider.container.scrollLeft;
			// change cursor to grabbing
			slider.container.style.cursor = 'grabbing';
			slider.container.style.scrollSnapType = 'none';
			slider.container.style.scrollBehavior = 'auto';
			// prevent focus going to the slides
			e.preventDefault();
			e.stopPropagation();
		};

		const mouseMove = (e: MouseEvent) => {
			if ( ! slider.details.hasOverflow ) {
				return;
			}
			if (!isMouseDown) {
				return;
			}
			e.preventDefault();
			const x = e.pageX - slider.container.offsetLeft;
			const walk = (x - startX);
			slider.container.scrollLeft = scrollLeft - walk;

			const absWalk = Math.abs(walk);
			const slides = slider.container.querySelectorAll( slider.options.slidesSelector );
			const pointerEvents = absWalk > options.draggedDistanceThatPreventsClick ? 'none' : '';
			slides.forEach((slide) => {
				(<HTMLElement>slide).style.pointerEvents = pointerEvents;
			});
		};

		const mouseUp = () => {
			if ( ! slider.details.hasOverflow ) {
				return;
			}
			isMouseDown = false;
			slider.container.style.cursor = '';
			setTimeout(() => {
				slider.container.style.scrollSnapType = '';
				slider.container.style.scrollBehavior = '';
				const slides = slider.container.querySelectorAll( slider.options.slidesSelector );
				slides.forEach((slide) => {
					(<HTMLElement>slide).style.pointerEvents = '';
				});
			}, 50);
		};

		window.addEventListener('mousedown', mouseDown);
		window.addEventListener('mousemove', mouseMove);
		window.addEventListener('mouseup', mouseUp);

	};
};
