import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;

public abstract class TypeReference<T> {

    private final Type type;
    private final Type superType;
    private volatile Constructor<?> constructor;

    protected TypeReference() {
        final Type superclass = getClass().getGenericSuperclass();
        if (superclass instanceof Class) {
            throw new RuntimeException("Missing type parameter.");
        }

        this.type = ((ParameterizedType) superclass).getActualTypeArguments()[0];
        this.superType = !(this.type instanceof Class) ? ((ParameterizedType) this.type).getActualTypeArguments()[0] : null;
    }

    public T newInstance() throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
        if (constructor == null) {
            final Class<?> rawType = type instanceof Class<?>
                    ? (Class<?>) type
                    : (Class<?>) ((ParameterizedType) type).getRawType();
            constructor = rawType.getConstructor();
        }
        return (T) constructor.newInstance();
    }

    public Type getType() {
        return this.type;
    }

    public Class getTypeClass() {
        return (Class) (type instanceof Class ? type : ((ParameterizedType) type).getRawType());
    }

    public Type getSuperType() {
        return superType;
    }

    public Class getSuperTypeClass() {
        return (Class) (superType instanceof Class ? superType : ((ParameterizedType) superType).getRawType());
    }

    public boolean hasSuperType() {
        return superType != null;
    }
}
