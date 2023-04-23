Little languages is a collection of projects that, collectively, represent my
journey into the world of programming languages and their implementations. The
projects are written in a variety of languages, and are intended to be small,
self-contained, and easy to understand. The goal is to learn about the design
and implementation of programming languages, and to have fun doing it.

Specifically this project has the scripts needed to execute the output from my
efforts. The scripts are written in [Deno](https://deno.land) and are intended to be run on
Linux or Mac.

The projects that are included in this repository are:

- [`stlc`](https://github.com/littlelanguages/ll-stlc) - an implementation of
  the typed lambda calculus. `stlc` is a functional programming language that
  supports Unit, Bool, Int, String and higher-order functions. It enables naming
  values with _let_ and recursive values with _let rec_.
- [`tlca`](https://github.com/littlelanguages/ll-tlca) - a functional
  programming language incorporating abstract data types (ADTs). `tlca` exhibits
  no side-effects in expressions and uses the Hindley-Milner type inference
  system for strong typing. It supports Unit, Bool, Int, String, higher-order
  functions, tuples, and ADTs, enables naming values with _let_ and recursive
  values with _let rec_, and pattern matching for ADT value deconstruction.

## Setup

To run the scripts, you will need to install Deno. You can find instructions for
installing Deno [here](https://deno.land/#installation). Once you have Deno
installed, run the scripts with the following command:

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

## Usage

The following commands are available and can be entered from the command line.

| Purpose | Command |
| ------- | ------- |
| Get help on the installation commands | `ll help` |
| Update the entire installation | `ll setup` |
| Get help on `stlc` | `ll-stlc help` |
| Compile and run an `stlc` program | `ll-stlc run <file>` |
| Start an `stlc` REPL | `ll-stlc repl` |
| Interpret an `stlc` program | `ll-stlc repl <file>` |
| Get help on `tlca` | `ll-tlca help` |
| Compile and run a `tlca` program | `ll-tlca run <file>` |
| Start a `tlca` REPL | `ll-tlca repl` |
| Interpret a `tlca` program | `ll-tlca repl <file>` |

Most of all, use the `help` command to get more information on the commands.