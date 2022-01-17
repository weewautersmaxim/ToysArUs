// //@ts-nocheck
import React from "react";
import * as THREE from "three";
import Navbar from "../components/nav";

export default function Home() {
  return (
    <main>
      <header className="c-container">
        <Navbar />
        <section className="c-section">
          <div className="c-section__50">
            <div className="c-section__content">
              <h1>Best Action figures for everyone</h1>
              <p>
                For vintage and new high quality toys, head to The Toys "AR" Us!
                For fans, enthusiasts and collectors of all ages.
              </p>
              <button>Shop now</button>
            </div>
          </div>
          <div className="c-section__50 c-section__img-container">
            <img
              className="c-section__img"
              src="homescreen.png"
              alt="3d-model"
            />
          </div>
        </section>
      </header>
      <img className="bcImage" src="background.svg" alt="background" />

      <section className="c-info">
        <h2 className="c-info__title">Why buy an action figure online?</h2>
        <div className="c-info__container">
          <div className="c-info__box">
            <div className="c-info__circle">
              <img className="c-info__cirlceImg" src="clock.svg" alt="clock" />
            </div>
            <h3>Fast</h3>
            <p className="c-info__text">
              Buy today and receive the action figure tomorrow!
            </p>
          </div>
          <div className="c-info__box">
            <div className="c-info__circle">
              <img className="c-info__cirlceImg" src="safe.svg" alt="safe" />
            </div>
            <h3>Safe</h3>
            <p className="c-info__text">
              Using the newest technologies to safeguard your info
            </p>
          </div>
          <div className="c-info__box">
            <div className="c-info__circle">
              <img className="c-info__cirlceImg" src="ar.svg" alt="safe" />
            </div>
            <h3>AR</h3>
            <p className="c-info__text">
              Watch the action figure in augmented reality
            </p>
          </div>
        </div>
      </section>
      <section className="c-shop">
        <h3 className="c-shop__title">Merchandise - Action figures</h3>
        <div className="c-item">
          <div className="c-figure">
            <img
              className="c-figure__img"
              src="action figure.png"
              alt="action figure"
            />
          </div>
          <div className="c-details">
            <h4 className="c-details__h4">
              Pumpkin Man - 17cm Male action figure
            </h4>
            <p className="c-details__p">
              Original merchandise from the 1978 tv-show "Pumpkin".
            </p>
            <p className="c-details__euro">€ 14.98</p>
            <div className="c-buttons">
              <button className="c-buy">Buy product</button>
              <button className="c-ar">
                watch in AR <img src="ar.svg" alt="Augmented reality" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
