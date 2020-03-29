import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputBase } from '@material-ui/core';

interface Props {
    open: boolean;
    onClose: () => void;
    onPay: () => void;
}
const PayDialog: React.FC<Props> = (props) => {
    const [str, setStr] = useState('');
    return (
        <Dialog disableBackdropClick disableEscapeKeyDown open={props.open} onClose={props.onClose}>
            <DialogTitle>付款</DialogTitle>
            <DialogContent>
                由于缺乏支付接口，请在下方输入“付款”，进行付款！
                <div>
                    <InputBase value={str} onChange={(event) => setStr(event.target.value)} placeholder="输入付款！" />
                </div>
                <DialogActions>
                    <Button color={"primary"}
                        onClick={() => {
                            if (str === '付款') {
                                props.onPay();
                            }
                        }}
                    >
                        确认
                    </Button>
                    <Button onClick={props.onClose}>取消</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    );
};
export default PayDialog;
