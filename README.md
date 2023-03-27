Little languages is a collection of projects that, collectively, represent my
journey into the world of programming languages. The projects are written in a
variety of languages, and are intended to be small, self-contained, and easy to
understand. The goal is to learn about the design and implementation of
programming languages, and to have fun doing it.

Specifically this project has the scripts needed to execute the output from my
efforts. The scripts are written in Deno and bash and are intended to be run on
Linux or Mac.

## Setup

To run the scripts, you will need to install Deno. You can find instructions for
installing Deno [here](https://deno.land/#installation). Once you have Deno
installed, you can run the scripts with the following command:

```bash
deno run --allow-all --reload https://raw.githubusercontent.com/littlelanguages/ll/main/setup.ts
```

This will download the latest version of the setup scripts and install them into
the correct locations. It is also necessary to add

```
~/.ll/bin
```

into your path.

## Testing the Setup

To test the setup, create a directory and add the following file named `x.tlca`
with the contents:

```
let x = 10
and y = x + 3 ;

x + y
```

Then run the following command:

```bash
ll-tlca run x.tlca
```

If everything is working correctly, you will see the following output:

```
x = 10: Int
y = 13: Int
23: Int
```
