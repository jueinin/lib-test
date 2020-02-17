import {fromEvent, interval, Observable, of} from "rxjs";
import {concatAll, delay, exhaust, expand, map, mapTo, scan, take, throttleTime} from "rxjs/operators";
import {EventTargetLike} from "rxjs/internal-compatibility";
import validate = WebAssembly.validate;
import {eventNames} from "cluster";
import {Simulate} from "react-dom/test-utils";
import click = Simulate.click;

// const eventObservable = fromEvent(document.getElementById("root")!, "click");
// eventObservable.pipe(scan((count) => count + 1, 0))
//     .subscribe(count => console.log(count));
// eventObservable.pipe(scan((count) => count + 1, 0))
//     .subscribe(count => console.log(count));



// fromEvent(document.getElementById('root')!, 'click')
//     .pipe(throttleTime(1000), scan(count => count + 1, 0))
//     .subscribe(count => console.log(count));

// fromEvent<MouseEvent>(document.getElementById('root')!, 'click')
//     .pipe(throttleTime(500),
//         map(event => event.clientX),
//         scan((count, clientX) => count + clientX, 0)
//     ).subscribe((clientXSum => console.log(clientXSum)));

// const myObservable = new Observable(subscriber => {
//     subscriber.next(1);
//     subscriber.next(9);
//     subscriber.next(4);
//     setTimeout(() => {
//         subscriber.next(6);
//         subscriber.complete(); // after complete, can not next
//         subscriber.next(0);
//     }, 1000);
//     subscriber.next(3);
// });
// myObservable.subscribe(value => {
//     console.log(value);
// });
// myObservable.subscribe({
//     next: value => {
//         console.log(value);
//     },
//     complete: () => {
//         console.log("complete")
//     }
// });

// observable like a generator function (function*), subscribe,call it many times,
// so that observable (generator function) return all it's value
// 多次调用subscribe 多次执行observable

// interval(1000).subscribe(value => console.log(value));

// @ts-ignore
// map((x) => x * x)(of(1, 2, 3)).subscribe(v => console.log(v));
// of(1, 2, 3).pipe(map(x => x * x));

// const fromEvent1 = (ele: Element, eventName: string) => {
//     return new Observable(subscriber => {
//         ele.addEventListener(eventName,ev => {
//             subscriber.next(ev);
//         })
//     })
// };

// const fromPromise = (promise: Promise<any>) => {
//     return new Observable(subscriber => {
//         promise.then((value) => {
//             subscriber.next(value);
//         }).catch(error => {
//             subscriber.error(error)
//         }).finally(() => {
//             subscriber.complete()
//         })
//     })
// };


// const clicks = fromEvent(document.getElementById('root'), 'click');
// const higherOrder = clicks.pipe(
//     map((ev) => interval(1000).pipe(take(5))),
// );
// const result = higherOrder.pipe(exhaust());
// result.subscribe((x:any) => console.log(x));

// fromEvent(document.getElementById('root'), "click")
//     .pipe(map(e => interval(1000).pipe(take(5))), concatAll()).subscribe((value:any) => console.log(value));
// const clicks = fromEvent(document, 'click');
// const powersOfTwo = clicks.pipe(
//     mapTo(1),
//     expand(x => of(2 * x).pipe(delay(1000))),
//     take(10),
// );
// powersOfTwo.subscribe(x => console.log(x));
