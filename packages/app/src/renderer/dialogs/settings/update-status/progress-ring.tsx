import * as S from './styles';

export type Props = {
  progress: number;
};

const StrokeWidth = 3;

const ProgressRing = (props: Props): JSX.Element => {
  const {progress} = props;

  // SVG strokes end up on the outside of the shape.
  const innerDiameter = S.SpinnerSize - StrokeWidth;
  const circumference = innerDiameter * Math.PI;

  const offset = (circumference - progress * circumference).toFixed(2);

  return (
    <S.ProgressRing>
      <circle
        r={innerDiameter / 2}
        cx={S.SpinnerSize / 2}
        cy={S.SpinnerSize / 2}
        fill='none'
        stroke='currentColor'
        strokeWidth={StrokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{strokeDashoffset: `${offset}px`}}
      />
    </S.ProgressRing>
  );
};

export default ProgressRing;
