import styles from '../styles';

const regex = /^[A-Za-z0-9]+$/;

const CustomInput = ({ label, placeHolder, value, handleValueChange, restStyles }) => (
    <>
        <label htmlFor="name" className={styles.label}>{label}</label>
        <input
            type='text'
            placeholder={placeHolder}
            value={value}
            step="0.01"
            onChange={(e) => {
                if (e.target.value === '' || regex.test(e.target.value)) 
                    handleValueChange(e.target.value);
            }}
            className={`${styles.input} ${restStyles}`}
        />
    </>
);

export default CustomInput;
