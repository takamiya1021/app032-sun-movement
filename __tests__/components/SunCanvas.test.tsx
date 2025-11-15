import { render } from '@testing-library/react';
import SunCanvas from '@/components/SunCanvas';

describe('SunCanvas', () => {
  it('Canvasがレンダリングされる', () => {
    const { container } = render(
      <SunCanvas
        date={new Date(2025, 0, 13)}
        time={3}
        latitude={35.6762}
        longitude={139.6503}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('propsが変更されると再描画される', () => {
    const { rerender, container } = render(
      <SunCanvas
        date={new Date(2025, 0, 13)}
        time={3}
        latitude={35.6762}
        longitude={139.6503}
      />
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // propsを変更
    rerender(
      <SunCanvas
        date={new Date(2025, 0, 13)}
        time={12}
        latitude={35.6762}
        longitude={139.6503}
      />
    );

    // Canvasはまだ存在している
    expect(canvas).toBeInTheDocument();
  });
});
