import { formatUnits } from "ethers/lib/utils";
import styles from "../styles";

const AmountOut = ({ amountOut }) => {
    return (
        <div className={styles.amountContainer}>
            <input
                placeholder="0.1"
                type="number"
                value={amountOut}
                className={styles.amountInput}
                disabled
            />
            <div className="relative">
                AVAX
            </div>
        </div>
    );
};

export default AmountOut;
