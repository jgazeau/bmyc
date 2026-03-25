class Singleton(type):
    def __init__(cls, name, bases, methods):
        cls._instance = None
        super().__init__(name, bases, methods)

    def __call__(cls, *args, **kwargs):
        if cls._instance:
            return cls._instance
        cls._instance = super().__call__(*args, **kwargs)
        return cls._instance

    def clear(cls):
        cls._instance = None
