
from shared_memory_dict import SharedMemoryDict, hooks
from multiprocessing import Process
from multiprocessing import shared_memory


def f(d, i):
    print(d["test" + str(i)])


if __name__ == "__main__":
    smd = SharedMemoryDict(name='tokens', size=1024 * 1024 * 1024)
    num = 256
    for i in range(num):
        smd["test" + str(i)] = 1

    ps = []
    for i in range(num):
        ps.append(Process(target=f, args=(smd, i)))
        ps[-1].start()

    for i in range(num):
        ps[i].join()

    smd.cleanup()
    hooks.free_shared_memory('tokens')
