import React from "react";
import { formatUnits, parseUnits } from "ethers/lib/utils";

import styles from "../styles";

const Balance = ({ tokenBalance }) => {
  // console.log(tokenBalance);
  return (
    <div className={styles.balance}>
      <p className={styles.balanceText}>
        {tokenBalance ? (
          <>
            <span className={styles.balanceBold}> 
            {formatUnits(tokenBalance ?? parseUnits("0"))}</span>
          </>
        ) : (
          "..."
        )}
      </p>
    </div>
  );
};

export default Balance;
