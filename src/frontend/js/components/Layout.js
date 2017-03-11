import React from "react";
import Room from "./room";
import VideoPlayer from "./videoPlayer";
//insert css here using require statement


const Layout = () => (
  <div>
    <h1>NOW-SYNC</h1>
    <Room />
    <VideoPlayer />
  </div>
);

export default Layout;
