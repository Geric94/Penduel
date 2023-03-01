import React, { useState, useEffect, useRef } from "react";

import styles from "../styles";

const AmountIn = ({ value, onChange }) => {

  return (
    <div className={styles.amountContainer}>
      <input
        placeholder="0.01"
        type="number"
        value={value}
        step="0.01"
        onChange={(e) => typeof onChange === "function" && onChange(e.target.value)}
        className={styles.amountInput}
      />
      <div className="relative">
        AVAX
      </div>
    </div>
  );
};

export default AmountIn;