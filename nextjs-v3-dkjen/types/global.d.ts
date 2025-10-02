// react-slick.d.ts
declare module "react-slick" {
  import * as React from "react";

  export interface Settings {
    className?: string;
    adaptiveHeight?: boolean;
    arrows?: boolean;
    autoplay?: boolean;
    autoplaySpeed?: number;
    dots?: boolean;
    draggable?: boolean;
    infinite?: boolean;
    slidesToShow?: number;
    slidesToScroll?: number;
    speed?: number;
    [key: string]: any;
  }

  export default class Slider extends React.Component<Settings> {}
}
